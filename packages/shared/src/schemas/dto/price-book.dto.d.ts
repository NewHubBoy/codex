import { z } from "zod";
export declare const PriceBookDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    name: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}>;
export type PriceBookDTO = z.infer<typeof PriceBookDTOSchema>;
