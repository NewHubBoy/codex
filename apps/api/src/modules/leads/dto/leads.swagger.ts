import { ApiProperty } from "@nestjs/swagger";

const LEAD_STATUSES = [
  "DRAFT",
  "NEW",
  "ASSIGNED",
  "WORKING",
  "INTERESTED",
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

  @ApiProperty({
    required: false,
    enum: LEAD_STATUSES
  })
  status?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  contactName?: string | null;

  @ApiProperty({ required: false })
  companyName?: string | null;

  @ApiProperty({ required: false })
  phone?: string | null;

  @ApiProperty({ required: false })
  email?: string | null;

  @ApiProperty({ required: false })
  source?: string | null;

  @ApiProperty({ required: false })
  rating?: string | null;

  @ApiProperty({ required: false })
  expectedValue?: number | null;

  @ApiProperty({ required: false })
  initialNeed?: string | null;

  @ApiProperty({ required: false })
  firstFollowUpDueAt?: string | null;

  @ApiProperty({ required: false })
  lastActivityAt?: string | null;

  @ApiProperty({ required: false })
  nextFollowUpAt?: string | null;

  @ApiProperty({ required: false })
  disqualifyReason?: string | null;

  @ApiProperty({ required: false })
  disqualifyNote?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  description?: string | null;
}

export class CreateLeadDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  contactName!: string;

  @ApiProperty()
  companyName!: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  source!: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  expectedValue?: number;

  @ApiProperty()
  initialNeed!: string;

  @ApiProperty()
  firstFollowUpDueAt!: string;

  @ApiProperty({ required: false })
  disqualifyReason?: string;

  @ApiProperty({ required: false })
  disqualifyNote?: string;

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
  contactName?: string;

  @ApiProperty({ required: false })
  companyName?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  source?: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  expectedValue?: number;

  @ApiProperty({ required: false })
  initialNeed?: string;

  @ApiProperty({ required: false })
  firstFollowUpDueAt?: string;

  @ApiProperty({ required: false })
  disqualifyReason?: string;

  @ApiProperty({ required: false })
  disqualifyNote?: string;

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
