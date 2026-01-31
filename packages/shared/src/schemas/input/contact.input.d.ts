import { z } from "zod";
export declare const CreateContactInputSchema: z.ZodObject<{
    accountId: z.ZodString;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    bpId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    accountId: string;
    bpId?: string | null | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}, {
    name: string;
    accountId: string;
    bpId?: string | null | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}>;
export declare const UpdateContactInputSchema: z.ZodObject<{
    accountId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    role: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bpId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    bpId?: string | null | undefined;
    accountId?: string | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}, {
    name?: string | undefined;
    bpId?: string | null | undefined;
    accountId?: string | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}>;
export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactInputSchema>;
