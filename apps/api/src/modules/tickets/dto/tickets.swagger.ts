import { ApiProperty } from "@nestjs/swagger";

export class TicketDto {
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
  type?: string | null;

  @ApiProperty({ required: false })
  priority?: string | null;

  @ApiProperty({ required: false })
  subject?: string | null;

  @ApiProperty({ required: false })
  slaDueAt?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  orderId?: string | null;
}

export class CreateTicketDto {
  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  priority?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  slaDueAt?: string;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  orderId?: string | null;
}

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  priority?: string;

  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  slaDueAt?: string;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  orderId?: string | null;
}
