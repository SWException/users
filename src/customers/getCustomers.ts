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
        if (!(USER && USER.isAuthenticate() && USER.isAdmin())) {
            return response(401, "TOKEN non valido o scaduto");
        }
    }
    
    const PARAMS = {
        UserPoolId: process.env.AWS_USER_POOL_ID,
        GroupName: "Client"
    };
  
    const RES_TEMP = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.listUsersInGroup(PARAMS).promise();
    
    const RES = [];
    RES_TEMP.Users.forEach((user)=>{
        RES.push({
            username: user.Username,
            userStatus: user.UserStatus,
            name: user.Attributes["name"],
            surname: user.Attributes["family_name"],
            email: user.Attributes["email"],
            emailVerified: user.Attributes["email_verified"],
            createDate: user.UserCreateDate,
            lastModifiedDate: user.UserLastModifiedDate,
            MFAOptions: user.MFAOptions,
            enabled: user.Enabled
            
        })
    })

    return response(200, null, RES);
}