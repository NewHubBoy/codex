import { z } from "zod";
import { PRODUCT_STATUSES } from "../../statuses";

const ProductStatusSchema = z.enum(PRODUCT_STATUSES);

export const CreateProductInputSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  listPrice: z.number().optional(),
  currency: z.string().optional(),
  status: ProductStatusSchema.optional()
});

export const UpdateProductInputSchema = CreateProductInputSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
