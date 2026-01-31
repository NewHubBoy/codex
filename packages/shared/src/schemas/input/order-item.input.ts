import { z } from "zod";
import { IdSchema } from "../base";

export const CreateOrderItemInputSchema = z.object({
  productId: IdSchema.nullish(),
  qty: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  lineTotal: z.number().min(0).optional()
});

export const UpdateOrderItemInputSchema = CreateOrderItemInputSchema.partial();

export type CreateOrderItemInput = z.infer<typeof CreateOrderItemInputSchema>;
export type UpdateOrderItemInput = z.infer<typeof UpdateOrderItemInputSchema>;
