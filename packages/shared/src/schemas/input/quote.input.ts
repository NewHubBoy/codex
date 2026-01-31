import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const CreateQuoteInputSchema = z.object({
  status: z.string().optional(),
  version: z.number().optional(),
  validFrom: DateTimeSchema.optional(),
  validTo: DateTimeSchema.optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  opportunityId: IdSchema.nullish(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish()
});

export const UpdateQuoteInputSchema = CreateQuoteInputSchema.partial();

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>;
export type UpdateQuoteInput = z.infer<typeof UpdateQuoteInputSchema>;
