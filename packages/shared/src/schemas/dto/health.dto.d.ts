import { z } from "zod";
export declare const HealthResponseSchema: z.ZodObject<{
    status: z.ZodString;
    service: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
    service: string;
}, {
    status: string;
    service: string;
}>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
