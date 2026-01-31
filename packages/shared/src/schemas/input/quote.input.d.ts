import { z } from "zod";
export declare const CreateQuoteInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    opportunityId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    version?: number | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
}, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    version?: number | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
}>;
export declare const UpdateQuoteInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    version: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    validFrom: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    validTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    totalAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    opportunityId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    accountId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contactId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    version?: number | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
}, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    version?: number | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
}>;
export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>;
export type UpdateQuoteInput = z.infer<typeof UpdateQuoteInputSchema>;
