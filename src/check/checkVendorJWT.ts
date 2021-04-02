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
        if(USER.isAdmin()){
            return response(200, null, {username: USER.getUsername()})
        }
    }
    
    return response(401, "Not valid token or not a vendor");
    
}