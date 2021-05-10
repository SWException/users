import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk"
import { getTokenFromEvent } from "src/utils/checkJWT";
import User from "src/User";
import response from "src/utils/apiResponses";

const COGNITO_IDENTITY_SERVICE_PROVIDER = 
    new AWS.CognitoIdentityServiceProvider();

export const HANDLER: APIGatewayProxyHandler = async (event) => {
    
    const TOKEN = getTokenFromEvent(event);
    if (TOKEN == null) {
        return response(400, "manca TOKEN");
    }
    else {
        const USER: User = await User.createUser(TOKEN);
        if (!(USER && USER.isAuthenticate() && (USER.isAdmin() || (await USER.isClient() && USER.getUsername() == event.pathParameters?.id)))) {
            return response(401, "TOKEN non valido o scaduto");
        }
    }
    
    const PARAMS = {
        UserPoolId: process.env.AWS_USER_POOL_ID,
        Username: event.pathParameters?.username
    };

    AWS.config.update({ region: process.env.AWS_REGION, 'accessKeyId': process.env.AWS_COGNITO_ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_COGNITO_SECRET_ACCESS_KEY });
  
    const USER = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.adminGetUser(PARAMS).promise();

    const ATTRIBUTES = [];
    USER.UserAttributes.forEach((att) => ATTRIBUTES[att.Name] = att.Value);

    return response(200, null, {
        username: USER.Username,
        userStatus: USER.UserStatus,
        name: ATTRIBUTES["name"],
        surname: ATTRIBUTES["family_name"],
        email: ATTRIBUTES["email"],
        emailVerified: ATTRIBUTES["email_verified"],
        createDate: USER.UserCreateDate,
        lastModifiedDate: USER.UserLastModifiedDate,
        MFAOptions: USER.MFAOptions,
        enabled: USER.Enabled
    });
}