"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBookDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.PriceBookDTOSchema = base_1.BaseEntitySchema.extend({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    validFrom: base_1.DateTimeSchema.optional(),
    validTo: base_1.DateTimeSchema.optional(),
    scope: zod_1.z.string().optional()
});
