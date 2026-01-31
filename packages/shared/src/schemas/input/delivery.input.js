"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDeliveryInputSchema = exports.CreateDeliveryInputSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.CreateDeliveryInputSchema = zod_1.z.object({
    orderId: base_1.IdSchema.nullish(),
    status: zod_1.z.string().optional(),
    deliveredAt: base_1.DateTimeSchema.optional(),
    deliveryNotes: zod_1.z.string().optional(),
    deliveredQty: zod_1.z.number().optional()
});
exports.UpdateDeliveryInputSchema = exports.CreateDeliveryInputSchema.partial();
