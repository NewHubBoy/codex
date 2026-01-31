import { z } from "zod";
import { DateTimeSchema } from "../base";

export const CreatePriceBookInputSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  currency: z.string().optional(),
  validFrom: DateTimeSchema.optional(),
  validTo: DateTimeSchema.optional(),
  scope: z.string().optional()
});

export const UpdatePriceBookInputSchema = CreatePriceBookInputSchema.partial();

export type CreatePriceBookInput = z.infer<typeof CreatePriceBookInputSchema>;
export type UpdatePriceBookInput = z.infer<typeof UpdatePriceBookInputSchema>;
