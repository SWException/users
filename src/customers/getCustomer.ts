import { APIGatewayProxyHandler } from "aws-lambda";
import API_RESPONSES from "src/utils/apiResponses";
import * as AWS from "aws-sdk"
import { getTokenFromEvent } from "src/utils/checkJWT";
import User from "src/User";

const COGNITO_IDENTITY_SERVICE_PROVIDER = 
    new AWS.CognitoIdentityServiceProvider();

export const HANDLER: APIGatewayProxyHandler = async (event) => {
    
    const TOKEN = getTokenFromEvent(event);
    if (TOKEN == null) {
        return API_RESPONSES._400(null, "error", "manca TOKEN");
    }
    else {
        const USER: User = await User.createUser(TOKEN);
        if (!(USER && USER.isAuthenticate() && (USER.isAdmin() || (USER.isClient() && USER.getUsername() == event.pathParameters?.id)))) {
            return API_RESPONSES._400(null,
                "error", "TOKEN non valido o scaduto");
        }
    }
    
    const PARAMS = {
        UserPoolId: process.env.AWS_USER_POOL_ID,
        Username: event.pathParameters?.id
    };
  
    const RES = await 
    COGNITO_IDENTITY_SERVICE_PROVIDER.adminGetUser(PARAMS).promise();
    
    return API_RESPONSES._200(RES);
}