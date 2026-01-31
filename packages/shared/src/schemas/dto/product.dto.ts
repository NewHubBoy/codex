import { z } from "zod";
import { BaseEntitySchema } from "../base";

export const ProductDTOSchema = BaseEntitySchema.extend({
  sku: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  listPrice: z.number().optional(),
  currency: z.string().optional(),
  status: z.string()
});

export type ProductDTO = z.infer<typeof ProductDTOSchema>;
