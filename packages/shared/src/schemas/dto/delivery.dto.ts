import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const DeliveryDTOSchema = BaseEntitySchema.extend({
  orderId: IdSchema.nullish(),
  status: z.string(),
  deliveredAt: DateTimeSchema.optional(),
  deliveryNotes: z.string().optional(),
  deliveredQty: z.number().optional()
});

export type DeliveryDTO = z.infer<typeof DeliveryDTOSchema>;
