"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.OrderDTOSchema = base_1.BaseEntitySchema.extend({
    number: zod_1.z.string().optional(),
    status: zod_1.z.string(),
    orderDate: base_1.DateTimeSchema.optional(),
    totalAmount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    opportunityId: base_1.IdSchema.nullish()
});
