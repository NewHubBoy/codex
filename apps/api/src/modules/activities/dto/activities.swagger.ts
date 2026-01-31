import { ApiProperty } from "@nestjs/swagger";

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
  relatedType?: string | null;

  @ApiProperty({ required: false })
  relatedId?: string | null;

  @ApiProperty({ required: false })
  dueAt?: string | null;

  @ApiProperty({ required: false })
  completedAt?: string | null;

  @ApiProperty({ required: false })
  outcome?: string | null;
}

export class CreateActivityDto {
  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ required: false })
  relatedType?: string;

  @ApiProperty({ required: false })
  relatedId?: string;

  @ApiProperty({ required: false })
  dueAt?: string;

  @ApiProperty({ required: false })
  completedAt?: string;

  @ApiProperty({ required: false })
  outcome?: string;
}
