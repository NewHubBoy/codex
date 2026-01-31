"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityDTOSchema = void 0;
const zod_1 = require("zod");
const base_1 = require("../base");
exports.ActivityDTOSchema = base_1.BaseEntitySchema.extend({
    type: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    relatedType: zod_1.z.string().optional(),
    relatedId: zod_1.z.string().optional(),
    dueAt: base_1.DateTimeSchema.optional(),
    completedAt: base_1.DateTimeSchema.optional(),
    outcome: zod_1.z.string().optional()
});
