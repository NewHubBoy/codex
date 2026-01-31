import { z } from "zod";
export declare const CreateTicketInputSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    slaDueAt: z.ZodOptional<z.ZodString>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    orderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    type?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    priority?: string | undefined;
    subject?: string | undefined;
    slaDueAt?: string | undefined;
    orderId?: string | null | undefined;
}, {
    status?: string | undefined;
    type?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    priority?: string | undefined;
    subject?: string | undefined;
    slaDueAt?: string | undefined;
    orderId?: string | null | undefined;
}>;
export declare const UpdateTicketInputSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    slaDueAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    accountId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    contactId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    orderId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    type?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    priority?: string | undefined;
    subject?: string | undefined;
    slaDueAt?: string | undefined;
    orderId?: string | null | undefined;
}, {
    status?: string | undefined;
    type?: string | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    priority?: string | undefined;
    subject?: string | undefined;
    slaDueAt?: string | undefined;
    orderId?: string | null | undefined;
}>;
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketInputSchema>;
