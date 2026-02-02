import { ApiProperty } from "@nestjs/swagger";

const TICKET_STATUSES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED"
] as const;

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

  @ApiProperty({ required: false, description: "Required for RESOLVED/CLOSED." })
  subject?: string;

  @ApiProperty({
    required: false,
    enum: TICKET_STATUSES,
    description: "RESOLVED/CLOSED require subject."
  })
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

  @ApiProperty({ required: false, description: "Required for RESOLVED/CLOSED." })
  subject?: string;

  @ApiProperty({
    required: false,
    enum: TICKET_STATUSES,
    description: "RESOLVED/CLOSED require subject."
  })
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
