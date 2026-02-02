import { ApiProperty } from "@nestjs/swagger";

const LEAD_STATUSES = [
  "NEW",
  "ASSIGNED",
  "WORKING",
  "QUALIFIED",
  "CONVERTED",
  "DISQUALIFIED"
] as const;

export class LeadDto {
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

  @ApiProperty({ required: false })
  source?: string | null;

  @ApiProperty({ required: false })
  rating?: string | null;

  @ApiProperty({ required: false })
  expectedValue?: number | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}

export class CreateLeadDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  source?: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  expectedValue?: number;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    required: false,
    enum: LEAD_STATUSES,
    description: "When status=CONVERTED, accountId or contactId is required."
  })
  status?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  source?: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  expectedValue?: number;

  @ApiProperty({
    required: false,
    description: "Required when status=CONVERTED if contactId is not provided."
  })
  accountId?: string | null;

  @ApiProperty({
    required: false,
    description: "Required when status=CONVERTED if accountId is not provided."
  })
  contactId?: string | null;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    required: false,
    enum: LEAD_STATUSES,
    description: "When status=CONVERTED, accountId or contactId is required."
  })
  status?: string;
}
