import { ApiProperty } from "@nestjs/swagger";

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
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  version?: number;

  @ApiProperty({ required: false })
  validFrom?: string;

  @ApiProperty({ required: false })
  validTo?: string;

  @ApiProperty({ required: false })
  totalAmount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  opportunityId?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}

export class UpdateQuoteDto {
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  version?: number;

  @ApiProperty({ required: false })
  validFrom?: string;

  @ApiProperty({ required: false })
  validTo?: string;

  @ApiProperty({ required: false })
  totalAmount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  opportunityId?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;
}
