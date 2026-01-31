import { z } from "zod";
export declare const CreateLeadInputSchema: z.ZodObject<{
    name: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodString>;
    expectedValue: z.ZodOptional<z.ZodNumber>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}, {
    name: string;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}>;
export declare const UpdateLeadInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rating: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    expectedValue: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    accountId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contactId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}>;
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;
