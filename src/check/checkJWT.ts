import { APIGatewayProxyHandler } from "aws-lambda";
import User from "src/User";
import response from "src/utils/apiResponses";

export const HANDLER: APIGatewayProxyHandler = async (event) => {
    console.log(event);
    
    const TOKEN = event.pathParameters?.token;
    console.log(TOKEN);
    const USER = await User.createUser(TOKEN);
    console.log(USER);

    if(USER && USER.isAuthenticate()){
        let type = "undefined";
        if (await USER.isClient()){
            type = "Client";
        }
        if(USER.isAdmin()){
            type = "Vendor";
        }
        return response(200, null, {username: USER.getUsername(), type: type})
    }
        
    return response(400, "Not valid token");
}