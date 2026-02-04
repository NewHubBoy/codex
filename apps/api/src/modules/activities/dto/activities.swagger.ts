import { ApiProperty } from "@nestjs/swagger";

const ACTIVITY_STATUSES = ["OPEN", "COMPLETED", "CANCELLED"] as const;

export class ActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty({ required: false })
  type?: string | null;

  @ApiProperty({ required: false })
  subject?: string | null;

  @ApiProperty({ required: false })
  content?: string | null;

  @ApiProperty({ required: false })
  relatedType?: string | null;

  @ApiProperty({ required: false })
  relatedId?: string | null;

  @ApiProperty({ required: false })
  dueAt?: string | null;

  @ApiProperty({ required: false })
  completedAt?: string | null;

  @ApiProperty({ required: false })
  outcome?: string | null;

  @ApiProperty({ required: false })
  nextFollowUpAt?: string | null;
}

export class CreateActivityDto {
  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ required: false })
  content?: string;

  @ApiProperty({ required: false })
  relatedType?: string;

  @ApiProperty({ required: false })
  relatedId?: string;

  @ApiProperty({ required: false })
  dueAt?: string;

  @ApiProperty({ required: false, description: "Required when status=COMPLETED." })
  completedAt?: string;

  @ApiProperty({ required: false })
  outcome?: string;

  @ApiProperty({ required: false })
  nextFollowUpAt?: string;

  @ApiProperty({
    required: false,
    enum: ACTIVITY_STATUSES,
    description: "COMPLETED requires completedAt."
  })
  status?: string;
}

export class UpdateActivityDto {
  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ required: false })
  content?: string;

  @ApiProperty({ required: false })
  relatedType?: string;

  @ApiProperty({ required: false })
  relatedId?: string;

  @ApiProperty({ required: false })
  dueAt?: string;

  @ApiProperty({ required: false, description: "Required when status=COMPLETED." })
  completedAt?: string;

  @ApiProperty({ required: false })
  outcome?: string;

  @ApiProperty({ required: false })
  nextFollowUpAt?: string;

  @ApiProperty({
    required: false,
    enum: ACTIVITY_STATUSES,
    description: "COMPLETED requires completedAt."
  })
  status?: string;
}
