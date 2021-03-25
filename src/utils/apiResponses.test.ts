import apiResponses, { response } from "src/utils/apiResponses"
import { matchersWithOptions } from 'jest-json-schema';
import { JSONSchema7 } from "json-schema";

import {SCHEMAS, setFormats} from 'src/utils/configAjv';
expect.extend(matchersWithOptions(SCHEMAS, (ajv) => setFormats(ajv)));

const SCHEMA: JSONSchema7 = {
    $ref: "schemas/response.json#/fullApiResponse"
};

test('response schema', () => {
    expect(SCHEMA).toBeValidSchema();
});

test('response with data', () => {
    let received = apiResponses._200({ test: "messaggio di test ok" });
    received.body = JSON.parse(received.body);
    expect(received.statusCode).toStrictEqual(200);
    expect(received).toMatchSchema(SCHEMA);

    received = apiResponses._400({ test: "messaggio di test ko" });
    received.body = JSON.parse(received.body);
    expect(received.statusCode).toStrictEqual(400);
    expect(received).toMatchSchema(SCHEMA);
});

test('response without data', () => {
    let received = apiResponses._200(null);
    received.body = JSON.parse(received.body);
    expect(received.statusCode).toStrictEqual(200);
    expect(received).toMatchSchema(SCHEMA);

    received = apiResponses._400(null);
    received.body = JSON.parse(received.body);
    expect(received.statusCode).toStrictEqual(400);
    expect(received).toMatchSchema(SCHEMA);
});

test('bad response', () => {

    // bad status
    let received = response(200, "status non accettato",
        { test: "dati di test" }, "messaggio di test");
    received.body = JSON.parse(received.body);
    expect(received).not.toMatchSchema(SCHEMA);

    // bad status
    received = response(200, "status non accettato",
        { test: "dati di test" }, "messaggio di test");
    received.body = JSON.parse(received.body);
    expect(received).not.toMatchSchema(SCHEMA);

    // null statusCode
    received = response(null, "error", null, null);
    received.body = JSON.parse(received.body);
    expect(received).not.toMatchSchema(SCHEMA);

});

test('particular response', () => {
    // null data
    let received = response(400, "error", null, "messaggio di test");
    received.body = JSON.parse(received.body);
    expect(received.body['data']).toBe(undefined);
    expect(received).toMatchSchema(SCHEMA);

    // data with null parameter
    received = response(400, "error", { testnull: null }, null);
    received.body = JSON.parse(received.body);
    expect(received.body['data']['testnull']).toStrictEqual(null);
    expect(received.body['message']).toBe(undefined);
    expect(received).toMatchSchema(SCHEMA);

    // null data e no message
    received = response(400, "error", null);
    received.body = JSON.parse(received.body);
    expect(received.body['message']).toBe(undefined);
    expect(received).toMatchSchema(SCHEMA);

    // empty object as data
    received = response(400, "error", {});
    received.body = JSON.parse(received.body);
    expect(received.body['data']).toStrictEqual({});
    expect(received).toMatchSchema(SCHEMA);

});
