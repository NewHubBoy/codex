import { ApiProperty } from "@nestjs/swagger";

const QUOTE_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED"
] as const;

export class QuoteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty()
  number!: string;

  @ApiProperty({ required: false })
  version?: number | null;

  @ApiProperty({ required: false })
  validFrom?: string | null;

  @ApiProperty({ required: false })
  validTo?: string | null;

  @ApiProperty({ required: false })
  totalAmount?: number | null;

  @ApiProperty({ required: false })
  currency?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}

export class CreateQuoteDto {
  @ApiProperty({
    required: false,
    enum: QUOTE_STATUSES,
    description:
      "APPROVED/SENT/ACCEPTED require totalAmount & currency; SENT/ACCEPTED require validTo; ACCEPTED requires accountId."
  })
  status?: string;

  @ApiProperty({ required: false })
  version?: number;

  @ApiProperty({ required: false })
  validFrom?: string;

  @ApiProperty({ required: false, description: "Required for SENT/ACCEPTED." })
  validTo?: string;

  @ApiProperty({
    required: false,
    description:
      "If omitted, totalAmount is recomputed from items. Required for APPROVED/SENT/ACCEPTED."
  })
  totalAmount?: number;

  @ApiProperty({ required: false, description: "Required for APPROVED/SENT/ACCEPTED." })
  currency?: string;

  @ApiProperty({ required: false })
  opportunityId?: string | null;

  @ApiProperty({ required: false, description: "Required when status=ACCEPTED." })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}

export class UpdateQuoteDto {
  @ApiProperty({
    required: false,
    enum: QUOTE_STATUSES,
    description:
      "APPROVED/SENT/ACCEPTED require totalAmount & currency; SENT/ACCEPTED require validTo; ACCEPTED requires accountId."
  })
  status?: string;

  @ApiProperty({ required: false })
  version?: number;

  @ApiProperty({ required: false })
  validFrom?: string;

  @ApiProperty({ required: false, description: "Required for SENT/ACCEPTED." })
  validTo?: string;

  @ApiProperty({
    required: false,
    description:
      "If omitted, totalAmount is recomputed from items. Required for APPROVED/SENT/ACCEPTED."
  })
  totalAmount?: number;

  @ApiProperty({ required: false, description: "Required for APPROVED/SENT/ACCEPTED." })
  currency?: string;

  @ApiProperty({ required: false })
  opportunityId?: string | null;

  @ApiProperty({ required: false, description: "Required when status=ACCEPTED." })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}
