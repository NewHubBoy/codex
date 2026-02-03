import { ApiProperty } from "@nestjs/swagger";

const ATTACHMENT_STATUSES = ["ACTIVE", "DELETED"] as const;

export class AttachmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty({ enum: ATTACHMENT_STATUSES })
  status!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({ required: false })
  checksumSha256?: string | null;

  @ApiProperty()
  storageProvider!: string;

  @ApiProperty()
  bucket!: string;

  @ApiProperty()
  objectKey!: string;

  @ApiProperty({ required: false })
  url?: string | null;

  @ApiProperty({ required: false, type: Object })
  metadata?: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateAttachmentDto {
  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({ required: false })
  checksumSha256?: string;

  @ApiProperty({ required: false, description: "Default S3" })
  storageProvider?: string;

  @ApiProperty()
  bucket!: string;

  @ApiProperty()
  objectKey!: string;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty({ required: false, type: Object })
  metadata?: Record<string, unknown>;

  @ApiProperty({ required: false, enum: ATTACHMENT_STATUSES })
  status?: string;
}

export class UpdateAttachmentDto {
  @ApiProperty({ required: false })
  fileName?: string;

  @ApiProperty({ required: false })
  mimeType?: string;

  @ApiProperty({ required: false })
  size?: number;

  @ApiProperty({ required: false })
  checksumSha256?: string;

  @ApiProperty({ required: false })
  storageProvider?: string;

  @ApiProperty({ required: false })
  bucket?: string;

  @ApiProperty({ required: false })
  objectKey?: string;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty({ required: false, type: Object })
  metadata?: Record<string, unknown>;

  @ApiProperty({ required: false, enum: ATTACHMENT_STATUSES })
  status?: string;
}

export class AttachmentLinkDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty()
  attachmentId!: string;

  @ApiProperty()
  relatedType!: string;

  @ApiProperty()
  relatedId!: string;

  @ApiProperty({ required: false })
  note?: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class CreateAttachmentLinkDto {
  @ApiProperty()
  relatedType!: string;

  @ApiProperty()
  relatedId!: string;

  @ApiProperty({ required: false })
  note?: string;
}

export class AttachmentConfigDto {
  @ApiProperty({ type: [String] })
  allowedMimeTypes!: string[];

  @ApiProperty()
  maxSizeBytes!: number;
}
