import { z } from "zod";
export declare const CreatePriceBookInputSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}, {
    name: string;
    type?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}>;
export declare const UpdatePriceBookInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    validFrom: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    validTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    scope: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    name?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}, {
    type?: string | undefined;
    name?: string | undefined;
    currency?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    scope?: string | undefined;
}>;
export type CreatePriceBookInput = z.infer<typeof CreatePriceBookInputSchema>;
export type UpdatePriceBookInput = z.infer<typeof UpdatePriceBookInputSchema>;
