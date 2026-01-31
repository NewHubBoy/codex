import { z } from "zod";
import { IdSchema } from "../base";

const OrgUnitStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const CreateOrgUnitInputSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  type: z.string().optional(),
  path: z.string().optional(),
  parentId: IdSchema.nullish(),
  status: OrgUnitStatusSchema.optional()
});

export const UpdateOrgUnitInputSchema = CreateOrgUnitInputSchema.partial();

export type CreateOrgUnitInput = z.infer<typeof CreateOrgUnitInputSchema>;
export type UpdateOrgUnitInput = z.infer<typeof UpdateOrgUnitInputSchema>;
