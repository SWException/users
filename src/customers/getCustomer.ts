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

    AWS.config.update({ region: process.env.AWS_REGION, 'accessKeyId': 'AKIASSX44DGDU4Y3W7LN', 'secretAccessKey': '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' });
  
    const user = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.adminGetUser(PARAMS).promise();

    const ATTRIBUTES = [];
    user.UserAttributes.forEach((att) => ATTRIBUTES[att.Name] = att.Value);

    return response(200, null, {
        username: user.Username,
        userStatus: user.UserStatus,
        name: ATTRIBUTES["name"],
        surname: ATTRIBUTES["family_name"],
        email: ATTRIBUTES["email"],
        emailVerified: ATTRIBUTES["email_verified"],
        createDate: user.UserCreateDate,
        lastModifiedDate: user.UserLastModifiedDate,
        MFAOptions: user.MFAOptions,
        enabled: user.Enabled
    });
}