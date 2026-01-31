import { z } from "zod";
import { BaseEntitySchema, IdSchema } from "../base";

export const AccountDTOSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  type: z.string().optional(),
  industry: z.string().optional(),
  rating: z.string().optional(),
  lifecycleStatus: z.string().optional(),
  parentId: IdSchema.nullish(),
  bpId: IdSchema.nullish()
});

export type AccountDTO = z.infer<typeof AccountDTOSchema>;
