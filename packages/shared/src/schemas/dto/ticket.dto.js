"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.TicketDTOSchema = base_1.BaseEntitySchema.extend({
    number: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    status: zod_1.z.string(),
    slaDueAt: base_1.DateTimeSchema.optional(),
    accountId: base_1.IdSchema.nullish(),
    contactId: base_1.IdSchema.nullish(),
    orderId: base_1.IdSchema.nullish()
});
