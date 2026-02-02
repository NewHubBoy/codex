import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const QuoteItemDTOSchema = z.object({
  id: IdSchema,
  serialId: z.number().int(),
  quoteId: IdSchema,
  productId: IdSchema.nullish(),
  qty: z.number().optional(),
  unitPrice: z.number().optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  lineTotal: z.number().optional(),
  createdAt: DateTimeSchema
});

export type QuoteItemDTO = z.infer<typeof QuoteItemDTOSchema>;
