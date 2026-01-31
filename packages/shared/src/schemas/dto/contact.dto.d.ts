import { z } from "zod";
export declare const ContactDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    accountId: z.ZodString;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    bpId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    accountId: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    bpId?: string | null | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    accountId: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    bpId?: string | null | undefined;
    title?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    role?: string | undefined;
}>;
export type ContactDTO = z.infer<typeof ContactDTOSchema>;
