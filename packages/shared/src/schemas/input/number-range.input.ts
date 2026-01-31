import { z } from "zod";

export const CreateNumberRangeInputSchema = z.object({
  objectType: z.string().min(1),
  prefix: z.string().optional(),
  currentValue: z.number().int().nonnegative().optional(),
  format: z.string().optional(),
  resetRule: z.string().optional()
});

export const UpdateNumberRangeInputSchema = CreateNumberRangeInputSchema.partial();

export type CreateNumberRangeInput = z.infer<typeof CreateNumberRangeInputSchema>;
export type UpdateNumberRangeInput = z.infer<typeof UpdateNumberRangeInputSchema>;
