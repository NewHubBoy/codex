"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketInputSchema = exports.CreateTicketInputSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.CreateTicketInputSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    slaDueAt: base_1.DateTimeSchema.optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    orderId: base_1.IdSchema.nullish()
});
exports.UpdateTicketInputSchema = exports.CreateTicketInputSchema.partial();
