import { z } from "zod";
import { IdSchema } from "../base";

export const CreateAccountInputSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  industry: z.string().optional(),
  rating: z.string().optional(),
  lifecycleStatus: z.string().optional(),
  parentId: IdSchema.nullish(),
  bpId: IdSchema.nullish()
});

export const UpdateAccountInputSchema = CreateAccountInputSchema.partial();

export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountInputSchema>;
