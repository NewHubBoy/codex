import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const CreateTicketInputSchema = z.object({
  type: z.string().optional(),
  priority: z.string().optional(),
  subject: z.string().optional(),
  status: z.string().optional(),
  slaDueAt: DateTimeSchema.optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  orderId: IdSchema.nullish()
});

export const UpdateTicketInputSchema = CreateTicketInputSchema.partial();

export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketInputSchema>;
