"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.AccountDTOSchema = base_1.BaseEntitySchema.extend({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    rating: zod_1.z.string().optional(),
    lifecycleStatus: zod_1.z.string().optional(),
    parentId: base_1.IdSchema.nullish(),
    bpId: base_1.IdSchema.nullish()
});
