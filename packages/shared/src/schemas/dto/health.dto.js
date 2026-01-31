"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthResponseSchema = void 0;
const zod_1 = require("zod");
exports.HealthResponseSchema = zod_1.z.object({
    status: zod_1.z.string(),
    service: zod_1.z.string()
});
