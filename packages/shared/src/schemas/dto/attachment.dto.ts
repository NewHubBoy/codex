import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const AttachmentDTOSchema = BaseEntitySchema.extend({
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number().int(),
  checksumSha256: z.string().optional(),
  storageProvider: z.string(),
  bucket: z.string(),
  objectKey: z.string(),
  url: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const AttachmentLinkDTOSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  orgUnitId: IdSchema.nullish(),
  ownerId: IdSchema.nullish(),
  attachmentId: IdSchema,
  relatedType: z.string(),
  relatedId: IdSchema,
  note: z.string().optional(),
  createdAt: DateTimeSchema
});

export type AttachmentDTO = z.infer<typeof AttachmentDTOSchema>;
export type AttachmentLinkDTO = z.infer<typeof AttachmentLinkDTOSchema>;
