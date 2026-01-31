import { z } from "zod";
export declare const IdSchema: z.ZodString;
export declare const DateTimeSchema: z.ZodString;
export declare const BaseEntitySchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
}>;
