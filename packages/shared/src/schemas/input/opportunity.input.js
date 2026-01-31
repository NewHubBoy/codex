"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOpportunityInputSchema = exports.CreateOpportunityInputSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.CreateOpportunityInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    stage: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    expectedCloseDate: base_1.DateTimeSchema.optional(),
    probability: zod_1.z.number().optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    leadId: base_1.IdSchema.nullish(),
    reasonLost: zod_1.z.string().optional()
});
exports.UpdateOpportunityInputSchema = exports.CreateOpportunityInputSchema.partial();
