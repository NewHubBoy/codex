import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";
import { DELIVERY_STATUSES } from "../../statuses";

const DeliveryStatusSchema = z.enum(DELIVERY_STATUSES);

export const CreateDeliveryInputSchema = z.object({
  orderId: IdSchema.nullish(),
  status: DeliveryStatusSchema.optional(),
  deliveredAt: DateTimeSchema.optional(),
  deliveryNotes: z.string().optional(),
  deliveredQty: z.number().optional()
});

export const UpdateDeliveryInputSchema = CreateDeliveryInputSchema.partial();

export type CreateDeliveryInput = z.infer<typeof CreateDeliveryInputSchema>;
export type UpdateDeliveryInput = z.infer<typeof UpdateDeliveryInputSchema>;
