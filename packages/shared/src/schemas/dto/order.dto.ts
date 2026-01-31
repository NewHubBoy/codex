import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const OrderDTOSchema = BaseEntitySchema.extend({
  number: z.string().optional(),
  status: z.string(),
  orderDate: DateTimeSchema.optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  opportunityId: IdSchema.nullish()
});

export type OrderDTO = z.infer<typeof OrderDTOSchema>;
