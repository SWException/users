import { APIGatewayProxyHandler } from "aws-lambda";
import User from "src/User";
import API_RESPONSES from "src/utils/apiResponses";

export const HANDLER: APIGatewayProxyHandler = async (event) => {
    console.log(event);
    
    const TOKEN = event.pathParameters?.token;
    console.log(TOKEN);
    const USER = await User.createUser(TOKEN);
    console.log(USER);

    if(USER && USER.isAuthenticate()){
        let type = "undefined";
        if(USER.isAdmin()){
            type = "vendor";
        }else if (USER.isClient()){
            type = "client";
        }
        return API_RESPONSES._200({username: USER.getUsername(), type: type})
    }else{
        return API_RESPONSES._400(null, "error", "Not valid token");
    }
}