import utils from 'src/utils/schema.json';
import categories from 'src/categories/schema.json';
import products from 'src/products/schema.json';
import cart from 'src/cart/schema.json';
import addresses from 'src/addresses/schema.json';
import orders from 'src/orders/schema.json';
import taxes from 'src/taxes/schema.json';
import Ajv from 'ajv';
import { JSONSchema7 } from 'json-schema';

export const SCHEMAS = {
    schemas: [utils as JSONSchema7, categories as JSONSchema7, products as JSONSchema7, cart as JSONSchema7, addresses as JSONSchema7, orders as JSONSchema7, taxes as JSONSchema7],
    strict: false
};

export function setFormats(ajv): void {
    ajv.addFormat("float", {
        type: "number",
        validate: /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
    });

    ajv.addFormat("int64", { type: "number", validate: /^\d+$/ });
    ajv.addFormat("uri", { type: "string" });
}

export function buildAjv(): Ajv {
    const AJV: Ajv = new Ajv(SCHEMAS);
    setFormats(AJV);
    return AJV;
}
