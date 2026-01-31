import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const OrderItemDTOSchema = z.object({
  id: IdSchema,
  orderId: IdSchema,
  productId: IdSchema.nullish(),
  qty: z.number().optional(),
  unitPrice: z.number().optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  lineTotal: z.number().optional(),
  createdAt: DateTimeSchema
});

export type OrderItemDTO = z.infer<typeof OrderItemDTOSchema>;
