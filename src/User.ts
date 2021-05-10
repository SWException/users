import jsonwebtoken from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import * as AWS from "aws-sdk"

export default class User {

    private readonly data: JSON;

    private constructor (json: JSON) {
        this.data = json;
    }

    public static async createUser
    (token: string): Promise<User> {
        try {
            const LINK = 'https://cognito-idp.' + process.env.AWS_REGION+ 
            '.amazonaws.com/' + process.env.AWS_USER_POOL_ID + 
            '/.well-known/jwks.json';
            let jsonWebKeys = null;
            await fetch(LINK)
                .then(res => res.json())
                .then(json => jsonWebKeys = json.keys);

            return User.validateToken(token, jsonWebKeys);
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }


    public isAuthenticate (): boolean {
        return (this.getExp() > Date.now() / 1000);
    }

    public async isClient (): Promise<boolean> {
        if(this.getGroups()?.includes("Client")){
            return true;
        }
        else if(!this.isAdmin()) {
            const COGNITO_IDENTITY_SERVICE_PROVIDER = 
                new AWS.CognitoIdentityServiceProvider();

            AWS.config.update({ 
                region: process.env.AWS_REGION, 
                'accessKeyId': process.env.AWS_COGNITO_ACCESS_KEY_ID, 
                'secretAccessKey': process.env.AWS_COGNITO_SECRET_ACCESS_KEY 
            });
            
            const PARAMS = {
                UserPoolId: process.env.AWS_USER_POOL_ID,
                Username: this.getUsername(),
                GroupName: "Client",
            };

            return await COGNITO_IDENTITY_SERVICE_PROVIDER.adminAddUserToGroup(PARAMS).promise()
                .then(()=>true)
                .catch((e)=>{
                    console.log(e);
                    return true;
                });
        }
        else
            return false;
    }

    public isAdmin (): boolean {
        return this.getGroups()?.includes("Admin");
    }

    public getUsername (): string {
        return this.data["username"];
    }

    public getDevice (): string {
        return this.data["device_key"];
    }

    public getGroups (): Array<string> {
        return this.data["cognito:groups"];
    }

    public getExp (): number {
        // scadenza del token
        return this.data["exp"];
    }

    public getAuthTime (): number {
        // quando è avvenuta l'autenticazione
        return this.data["auth_time"];
    }

    // dice quando è stato generato un token (potrebbe essere stato rigenerato)
    public getIat (): number {
        return this.data["iat"];
    }
    
    private static validateToken (token: string, jsonWebKeys): User {
        const HEADER = User.decodeTokenHeader(token);
        const JSON_WEB_KEY: string = 
            User.getJsonWebKeyWithKID(HEADER.kid, jsonWebKeys);
        let res: User = null;
        User.verifyJsonWebTokenSignature(token, JSON_WEB_KEY,
            (err: JSON, decodedToken: JSON) => {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(decodedToken);
                    res = new User(decodedToken);
                }
            });
        return res;
    }

    private static decodeTokenHeader (token: string) {
        const [HEADER_ENCODED] = token.split('.');
        //const BUFF = new Buffer(HEADER_ENCODED, 'base64');
        const BUFF = Buffer.from(HEADER_ENCODED, 'base64');
        const TEXT = BUFF.toString('ascii');
        console.log(TEXT);
        
        return JSON.parse(TEXT);
    }

    private static getJsonWebKeyWithKID (kid: string, jsonWebKeys) {
        for (const JWK of jsonWebKeys) {
            if (JWK.kid === kid) {
                return JWK;
            }
        }
        return null;
    }

    private static verifyJsonWebTokenSignature (token, jsonWebKey, clbk) {
        const PEM = jwkToPem(jsonWebKey);
        jsonwebtoken.verify(token, PEM, { algorithms: ['RS256'] },
            (err, decodedToken) => clbk(err, decodedToken))
    }

}