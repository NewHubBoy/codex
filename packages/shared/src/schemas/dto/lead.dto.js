"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.LeadDTOSchema = base_1.BaseEntitySchema.extend({
    name: zod_1.z.string().min(1),
    source: zod_1.z.string().optional(),
    rating: zod_1.z.string().optional(),
    expectedValue: zod_1.z.number().optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    description: zod_1.z.string().optional()
});
