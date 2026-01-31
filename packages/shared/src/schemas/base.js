"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntitySchema = exports.DateTimeSchema = exports.IdSchema = void 0;
const zod_1 = require("zod");
exports.IdSchema = zod_1.z.string().min(1);
exports.DateTimeSchema = zod_1.z.string().datetime();
exports.BaseEntitySchema = zod_1.z.object({
    id: exports.IdSchema,
    tenantId: exports.IdSchema,
    orgUnitId: exports.IdSchema.nullish(),
    ownerId: exports.IdSchema.nullish(),
    status: zod_1.z.string(),
    createdAt: exports.DateTimeSchema,
    updatedAt: exports.DateTimeSchema
});
