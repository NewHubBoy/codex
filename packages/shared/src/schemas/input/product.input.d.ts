import { z } from "zod";
export declare const CreateProductInputSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    listPrice: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status?: string | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}, {
    name: string;
    status?: string | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}>;
export declare const UpdateProductInputSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    listPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    name?: string | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}, {
    status?: string | undefined;
    name?: string | undefined;
    currency?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    listPrice?: number | undefined;
}>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
