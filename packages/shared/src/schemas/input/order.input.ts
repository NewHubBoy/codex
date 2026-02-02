import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";
import { ORDER_STATUSES } from "../../statuses";

const OrderStatusSchema = z.enum(ORDER_STATUSES);

export const CreateOrderInputSchema = z.object({
  status: OrderStatusSchema.optional(),
  orderDate: DateTimeSchema.optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  opportunityId: IdSchema.nullish()
});

export const UpdateOrderInputSchema = CreateOrderInputSchema.partial();

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderInputSchema>;
