import { APIGatewayProxyHandler } from "aws-lambda";
import User from "src/User";
import API_RESPONSES from "src/utils/apiResponses";

export const HANDLER: APIGatewayProxyHandler = async (event) => {
    console.log(event);
    
    const TOKEN = event.pathParameters?.token;
    console.log(TOKEN);
    const USER = await User.createUser(TOKEN);
    console.log(USER);
    
    if(USER){
        return API_RESPONSES._200({isAuthenticate: USER.isAuthenticate(), isVendor: USER.isAdmin()})
    }else{
        return API_RESPONSES._400(null, "error", "manca TOKEN asdf");
    }
}