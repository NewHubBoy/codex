import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";
import { QUOTE_STATUSES } from "../../statuses";

const QuoteStatusSchema = z.enum(QUOTE_STATUSES);

export const CreateQuoteInputSchema = z.object({
  status: QuoteStatusSchema.optional(),
  version: z.number().optional(),
  validFrom: DateTimeSchema.optional(),
  validTo: DateTimeSchema.optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  discountRate: z.number().optional(),
  isCustom: z.boolean().optional(),
  hasSpecialTerms: z.boolean().optional(),
  opportunityId: IdSchema.nullish(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish()
});

export const UpdateQuoteInputSchema = CreateQuoteInputSchema.partial();

export type CreateQuoteInput = z.infer<typeof CreateQuoteInputSchema>;
export type UpdateQuoteInput = z.infer<typeof UpdateQuoteInputSchema>;
