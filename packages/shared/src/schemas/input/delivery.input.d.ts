import { z } from "zod";
export declare const CreateDeliveryInputSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodString>;
    deliveredAt: z.ZodOptional<z.ZodString>;
    deliveryNotes: z.ZodOptional<z.ZodString>;
    deliveredQty: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}, {
    status?: string | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}>;
export declare const UpdateDeliveryInputSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    deliveredAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    deliveryNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    deliveredQty: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    status?: string | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}, {
    status?: string | undefined;
    orderId?: string | null | undefined;
    deliveredAt?: string | undefined;
    deliveryNotes?: string | undefined;
    deliveredQty?: number | undefined;
}>;
export type CreateDeliveryInput = z.infer<typeof CreateDeliveryInputSchema>;
export type UpdateDeliveryInput = z.infer<typeof UpdateDeliveryInputSchema>;
