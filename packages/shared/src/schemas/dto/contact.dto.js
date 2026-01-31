"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.ContactDTOSchema = base_1.BaseEntitySchema.extend({
    accountId: base_1.IdSchema,
    name: zod_1.z.string().min(1),
    title: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    bpId: base_1.IdSchema.nullish()
});
