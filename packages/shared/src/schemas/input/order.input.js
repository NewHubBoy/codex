"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderInputSchema = exports.CreateOrderInputSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.CreateOrderInputSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    orderDate: base_1.DateTimeSchema.optional(),
    totalAmount: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    opportunityId: base_1.IdSchema.nullish()
});
exports.UpdateOrderInputSchema = exports.CreateOrderInputSchema.partial();
