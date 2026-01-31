import { ApiProperty } from "@nestjs/swagger";

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
}

export class CreateOpportunityDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  stage?: string;

  @ApiProperty({ required: false })
  amount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  expectedCloseDate?: string;

  @ApiProperty({ required: false })
  probability?: number;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  leadId?: string | null;

  @ApiProperty({ required: false })
  reasonLost?: string | null;
}
