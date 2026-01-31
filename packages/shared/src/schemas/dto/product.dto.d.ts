import { z } from "zod";
export declare const ProductDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    listPrice: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}>;
export type ProductDTO = z.infer<typeof ProductDTOSchema>;
