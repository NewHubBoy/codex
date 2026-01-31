import { z } from "zod";
import { IdSchema } from "../base";

export const AssignRoleInputSchema = z.object({
  roleId: IdSchema
});

export const AssignPermissionInputSchema = z.object({
  permissionId: IdSchema
});

export type AssignRoleInput = z.infer<typeof AssignRoleInputSchema>;
export type AssignPermissionInput = z.infer<typeof AssignPermissionInputSchema>;
