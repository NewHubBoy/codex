import { ApiProperty } from "@nestjs/swagger";

export class ApprovalInstanceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiProperty({ required: false })
  ruleId?: string | null;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currentGroup!: number;

  @ApiProperty({ required: false })
  payload?: Record<string, unknown> | null;

  @ApiProperty({ required: false })
  createdBy?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class ApprovalTaskDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  instanceId!: string;

  @ApiProperty()
  nodeId!: string;

  @ApiProperty()
  roleCode!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  assigneeId?: string | null;

  @ApiProperty({ required: false })
  decidedAt?: string | null;

  @ApiProperty({ required: false })
  note?: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class ApprovalActionDto {
  @ApiProperty({ required: false })
  note?: string;
}
