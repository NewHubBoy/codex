import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const TicketDTOSchema = BaseEntitySchema.extend({
  number: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  subject: z.string().optional(),
  status: z.string(),
  slaDueAt: DateTimeSchema.optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  orderId: IdSchema.nullish()
});

export type TicketDTO = z.infer<typeof TicketDTOSchema>;
