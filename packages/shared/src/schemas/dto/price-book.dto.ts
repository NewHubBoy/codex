import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema } from "../base";

export const PriceBookDTOSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  type: z.string().optional(),
  currency: z.string().optional(),
  validFrom: DateTimeSchema.optional(),
  validTo: DateTimeSchema.optional(),
  scope: z.string().optional()
});

export type PriceBookDTO = z.infer<typeof PriceBookDTOSchema>;
