"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.DeliveryDTOSchema = base_1.BaseEntitySchema.extend({
    orderId: base_1.IdSchema.nullish(),
    status: zod_1.z.string(),
    deliveredAt: base_1.DateTimeSchema.optional(),
    deliveryNotes: zod_1.z.string().optional(),
    deliveredQty: zod_1.z.number().optional()
});
