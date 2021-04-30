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
        if (!(USER && USER.isAuthenticate() && (USER.isAdmin() || (USER.isClient() && USER.getUsername() == event.pathParameters?.id)))) {
            return response(401, "TOKEN non valido o scaduto");
        }
    }
    
    const PARAMS = {
        UserPoolId: process.env.AWS_USER_POOL_ID,
        Username: event.pathParameters?.username
    };
  
    const user = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.adminGetUser(PARAMS).promise();

    return response(200, null, {
        username: user.Username,
        userStatus: user.UserStatus,
        name: user.UserAttributes["name"],
        surname: user.UserAttributes["family_name"],
        email: user.UserAttributes["email"],
        emailVerified: user.UserAttributes["email_verified"],
        createDate: user.UserCreateDate,
        lastModifiedDate: user.UserLastModifiedDate,
        MFAOptions: user.MFAOptions,
        enabled: user.Enabled
    });
}