import { z } from "zod";

const DataScopeSchema = z.enum(["SELF", "TEAM", "SUBTREE", "ALL"]);
const RoleStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const CreateRoleInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  dataScope: DataScopeSchema.optional(),
  status: RoleStatusSchema.optional()
});

export const UpdateRoleInputSchema = CreateRoleInputSchema.partial();

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;
