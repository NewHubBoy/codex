import { ApiProperty } from "@nestjs/swagger";

export class AlertSummaryDto {
  @ApiProperty()
  leadFirstFollowUpOverdue!: number;

  @ApiProperty()
  leadNextFollowUpOverdue!: number;

  @ApiProperty()
  leadInactive!: number;

  @ApiProperty()
  opportunityStale!: number;

  @ApiProperty()
  inactiveDays!: number;

  @ApiProperty()
  staleDays!: number;
}

export class AlertSettingDto {
  @ApiProperty()
  inactiveDays!: number;

  @ApiProperty()
  staleDays!: number;

  @ApiProperty({ enum: ["USER", "ORG_UNIT", "TENANT", "DEFAULT"] })
  scopeType!: string;

  @ApiProperty({ required: false })
  scopeId?: string;
}

export class UpdateAlertSettingDto {
  @ApiProperty({ enum: ["USER", "ORG_UNIT", "TENANT"] })
  scopeType!: string;

  @ApiProperty({ required: false })
  inactiveDays?: number;

  @ApiProperty({ required: false })
  staleDays?: number;
}
