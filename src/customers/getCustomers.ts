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
  
    const RES = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.listUsersInGroup(PARAMS).promise();
    
    return response(200, null, RES.Users);
    

}