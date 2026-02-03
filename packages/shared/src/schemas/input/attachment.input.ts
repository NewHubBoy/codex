import { z } from "zod";
import { IdSchema } from "../base";
import { ATTACHMENT_STATUSES } from "../../statuses";

const AttachmentStatusSchema = z.enum(ATTACHMENT_STATUSES);
const StorageProviderSchema = z.enum(["S3"]);
const MimeTypeSchema = z
  .string()
  .min(1)
  .regex(/^[\w.+-]+\/[\w.+-]+$/, "Invalid mime type");

const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

export const CreateAttachmentInputSchema = z.object({
  fileName: z.string().min(1),
  mimeType: MimeTypeSchema,
  size: z.number().int().positive().max(MAX_ATTACHMENT_SIZE_BYTES),
  checksumSha256: z.string().optional(),
  storageProvider: StorageProviderSchema.optional(),
  bucket: z.string().min(1),
  objectKey: z.string().min(1),
  url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  status: AttachmentStatusSchema.optional()
});

export const UpdateAttachmentInputSchema = CreateAttachmentInputSchema.partial();

export const CreateAttachmentLinkInputSchema = z.object({
  relatedType: z.string().min(1),
  relatedId: IdSchema,
  note: z.string().optional()
});

export const DeleteAttachmentLinkInputSchema = z.object({
  relatedType: z.string().min(1),
  relatedId: IdSchema
});

export type CreateAttachmentInput = z.infer<typeof CreateAttachmentInputSchema>;
export type UpdateAttachmentInput = z.infer<typeof UpdateAttachmentInputSchema>;
export type CreateAttachmentLinkInput = z.infer<typeof CreateAttachmentLinkInputSchema>;
export type DeleteAttachmentLinkInput = z.infer<typeof DeleteAttachmentLinkInputSchema>;
