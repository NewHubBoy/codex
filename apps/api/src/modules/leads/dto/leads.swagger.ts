import { ApiProperty } from "@nestjs/swagger";

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

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  status?: string;
}
