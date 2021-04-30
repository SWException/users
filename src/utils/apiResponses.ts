import { APIGatewayProxyResult } from "aws-lambda";

export default function response (
    statusCode: number, 
    message?: string,
    data?: { [key: string]: any }): APIGatewayProxyResult {
    
    let status = "success";
    if (!(200 <= statusCode && statusCode < 300))
        status = "error";

    const BODY= {
        status
    };
    if(message)
        BODY["message"] = message;
    if(data)
        BODY["data"] = data;
    
    return {
        "statusCode": statusCode,
        "headers": {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
        },
        "body": JSON.stringify(BODY, null, 2)
    }
}