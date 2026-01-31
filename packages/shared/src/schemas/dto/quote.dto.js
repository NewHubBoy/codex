"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.QuoteDTOSchema = base_1.BaseEntitySchema.extend({
    number: zod_1.z.string().optional(),
    version: zod_1.z.number().optional(),
    status: zod_1.z.string(),
    validFrom: base_1.DateTimeSchema.optional(),
    validTo: base_1.DateTimeSchema.optional(),
    totalAmount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    opportunityId: base_1.IdSchema.nullish(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish()
});
