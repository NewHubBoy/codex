"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuoteInputSchema = exports.CreateQuoteInputSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.CreateQuoteInputSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    version: zod_1.z.number().optional(),
    validFrom: base_1.DateTimeSchema.optional(),
    validTo: base_1.DateTimeSchema.optional(),
    totalAmount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    opportunityId: base_1.IdSchema.nullish(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish()
});
exports.UpdateQuoteInputSchema = exports.CreateQuoteInputSchema.partial();
