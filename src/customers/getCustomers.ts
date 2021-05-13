import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk"
import { getTokenFromEvent } from "src/utils/checkJWT";
import User from "src/User";
import response from "src/utils/apiResponses";

export const HANDLER: APIGatewayProxyHandler = async (event) => {

    const TOKEN = getTokenFromEvent(event);
    if (TOKEN == null) {
        return response(400, "manca TOKEN");
    }

    const USER: User = await User.createUser(TOKEN);
    if (!(USER && USER.isAuthenticate())) {
        return response(401, "TOKEN non valido o scaduto");
    }

    if (!(USER.isAdmin())) {
        return response(401, "TOKEN non valido per un venditore");
    }

    const SEARCH = event.queryStringParameters?.search;

    // AWS.config.update({ region: process.env.AWS_REGION, 'accessKeyId': process.env.AWS_COGNITO_ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_COGNITO_SECRET_ACCESS_KEY });

    const COGNITO_IDENTITY_SERVICE_PROVIDER =
        new AWS.CognitoIdentityServiceProvider();

    try {
        const PARAMS = {
            UserPoolId: process.env.AWS_USER_POOL_ID,
            GroupName: "Client"
        };

        const RES_TEMP = await
        COGNITO_IDENTITY_SERVICE_PROVIDER.listUsersInGroup(PARAMS).promise();
        console.log(RES_TEMP.Users);

        const RES = [];
        RES_TEMP.Users.forEach((user) => {
            console.log(user);

            const ATTRIBUTES = [];
            user.Attributes.forEach((att) => ATTRIBUTES[att.Name] = att.Value);

            let resUser = null;

            if ((SEARCH && (ATTRIBUTES["email"].includes(SEARCH) || ATTRIBUTES["name"].includes(SEARCH) || ATTRIBUTES["family_name"].includes(SEARCH))) || !SEARCH) {
                resUser = {
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
                }
            }

            if (resUser)
                RES.push(resUser);
        })

        return response(200, null, RES);
    }
    catch (err: any) {
        return response(200, err?.message, err);
    }
}