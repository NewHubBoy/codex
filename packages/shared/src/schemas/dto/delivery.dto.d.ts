import { z } from "zod";
export declare const DeliveryDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    orderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    deliveredAt: z.ZodOptional<z.ZodString>;
    deliveryNotes: z.ZodOptional<z.ZodString>;
    deliveredQty: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}>;
export type DeliveryDTO = z.infer<typeof DeliveryDTOSchema>;
