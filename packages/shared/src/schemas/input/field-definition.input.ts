import { z } from "zod";

export const CreateFieldDefinitionInputSchema = z.object({
  entityType: z.string().min(1),
  fieldKey: z.string().min(1),
  label: z.string().min(1),
  dataType: z.string().min(1),
  required: z.boolean().optional(),
  optionsJson: z.record(z.unknown()).optional(),
  validationJson: z.record(z.unknown()).optional()
});

export const UpdateFieldDefinitionInputSchema = CreateFieldDefinitionInputSchema.partial();

export const CreateFieldGroupInputSchema = z.object({
  entityType: z.string().min(1),
  groupName: z.string().min(1),
  sortOrder: z.number().int().optional(),
  layoutJson: z.record(z.unknown()).optional()
});

export const UpdateFieldGroupInputSchema = CreateFieldGroupInputSchema.partial();

export type CreateFieldDefinitionInput = z.infer<typeof CreateFieldDefinitionInputSchema>;
export type UpdateFieldDefinitionInput = z.infer<typeof UpdateFieldDefinitionInputSchema>;
export type CreateFieldGroupInput = z.infer<typeof CreateFieldGroupInputSchema>;
export type UpdateFieldGroupInput = z.infer<typeof UpdateFieldGroupInputSchema>;
