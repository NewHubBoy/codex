import { z } from "zod";
export declare const CreateOrderInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    orderDate: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    opportunityId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}>;
export declare const UpdateOrderInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    orderDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    totalAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    accountId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contactId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    opportunityId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}, {
    status?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}>;
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderInputSchema>;
