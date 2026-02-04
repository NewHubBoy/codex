import { ApiProperty } from "@nestjs/swagger";

const OPPORTUNITY_STATUSES = ["OPEN", "WON", "LOST"] as const;

export class OpportunityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  stage!: string;

  @ApiProperty({ required: false })
  amount?: number | null;

  @ApiProperty({ required: false })
  currency?: string | null;

  @ApiProperty({ required: false })
  expectedCloseDate?: string | null;

  @ApiProperty({ required: false })
  probability?: number | null;

  @ApiProperty({ required: false })
  lastStageChangedAt?: string | null;
}

export class CreateOpportunityDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  stage?: string;

  @ApiProperty({ required: false, description: "Required when status=WON." })
  amount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false, description: "Required when status=WON." })
  expectedCloseDate?: string;

  @ApiProperty({ required: false })
  probability?: number;

  @ApiProperty({
    required: false,
    enum: OPPORTUNITY_STATUSES,
    description:
      "When status=WON requires amount & expectedCloseDate; when status=LOST requires reasonLost."
  })
  status?: string;

  @ApiProperty()
  accountId!: string;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  leadId?: string | null;

  @ApiProperty({ required: false, description: "Required when status=LOST." })
  reasonLost?: string | null;
}

export class UpdateOpportunityDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  stage?: string;

  @ApiProperty({ required: false, description: "Required when status=WON." })
  amount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false, description: "Required when status=WON." })
  expectedCloseDate?: string;

  @ApiProperty({ required: false })
  probability?: number;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  leadId?: string | null;

  @ApiProperty({ required: false, description: "Required when status=LOST." })
  reasonLost?: string | null;

  @ApiProperty({
    required: false,
    enum: OPPORTUNITY_STATUSES,
    description:
      "When status=WON requires amount & expectedCloseDate; when status=LOST requires reasonLost."
  })
  status?: string;
}
