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
