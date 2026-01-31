"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.ProductDTOSchema = base_1.BaseEntitySchema.extend({
    sku: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().optional(),
    listPrice: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    status: zod_1.z.string()
});
