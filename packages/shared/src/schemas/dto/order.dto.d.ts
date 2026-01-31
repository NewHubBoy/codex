import { z } from "zod";
export declare const OrderDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    number: z.ZodOptional<z.ZodString>;
    status: z.ZodString;
    orderDate: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    opportunityId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    number?: string | undefined;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    number?: string | undefined;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    accountId?: string | null | undefined;
    contactId?: string | null | undefined;
    currency?: string | undefined;
    totalAmount?: number | undefined;
    opportunityId?: string | null | undefined;
    orderDate?: string | undefined;
}>;
export type OrderDTO = z.infer<typeof OrderDTOSchema>;
