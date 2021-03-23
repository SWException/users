import { APIGatewayProxyEvent } from 'aws-lambda';

export function getTokenFromEvent
(event: APIGatewayProxyEvent): string {
    return event.headers?.Authorization;
}

export function getBodyDataFromEvent
(event: APIGatewayProxyEvent): JSON {
    return JSON.parse(event?.body);
}

export function getQueryDataFromEvent
(event: APIGatewayProxyEvent): JSON {
    return JSON.parse(JSON.stringify(event?.queryStringParameters));
}
