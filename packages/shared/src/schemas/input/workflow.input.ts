import { z } from "zod";

export const CreateProcessDefinitionInputSchema = z.object({
  entityType: z.string().min(1),
  name: z.string().min(1),
  isActive: z.boolean().optional()
});

export const UpdateProcessDefinitionInputSchema = CreateProcessDefinitionInputSchema.partial();

export const CreateProcessStateInputSchema = z.object({
  stateKey: z.string().min(1),
  displayName: z.string().min(1),
  category: z.string().optional(),
  sortOrder: z.number().int().optional()
});

export const CreateProcessTransitionInputSchema = z.object({
  fromState: z.string().min(1),
  toState: z.string().min(1),
  conditionExpr: z.string().optional(),
  requiredRoles: z.string().optional()
});

export type CreateProcessDefinitionInput = z.infer<typeof CreateProcessDefinitionInputSchema>;
export type UpdateProcessDefinitionInput = z.infer<typeof UpdateProcessDefinitionInputSchema>;
export type CreateProcessStateInput = z.infer<typeof CreateProcessStateInputSchema>;
export type CreateProcessTransitionInput = z.infer<typeof CreateProcessTransitionInputSchema>;
