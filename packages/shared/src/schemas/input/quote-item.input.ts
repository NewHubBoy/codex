import { z } from "zod";
import { IdSchema } from "../base";

export const CreateQuoteItemInputSchema = z.object({
  productId: IdSchema.nullish(),
  qty: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  lineTotal: z.number().min(0).optional()
});

export const UpdateQuoteItemInputSchema = CreateQuoteItemInputSchema.partial();

export const BulkQuoteItemsInputSchema = z.object({
  mode: z.enum(["append", "replace"]).optional(),
  items: z.array(CreateQuoteItemInputSchema).min(1)
});

export type CreateQuoteItemInput = z.infer<typeof CreateQuoteItemInputSchema>;
export type UpdateQuoteItemInput = z.infer<typeof UpdateQuoteItemInputSchema>;
export type BulkQuoteItemsInput = z.infer<typeof BulkQuoteItemsInputSchema>;
