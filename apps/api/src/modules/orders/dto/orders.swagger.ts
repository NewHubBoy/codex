import { ApiProperty } from "@nestjs/swagger";

export class OrderDto {
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
  orderDate?: string | null;

  @ApiProperty({ required: false })
  totalAmount?: number | null;

  @ApiProperty({ required: false })
  currency?: string | null;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;
}

export class CreateOrderDto {
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  orderDate?: string;

  @ApiProperty({ required: false })
  totalAmount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;
}

export class UpdateOrderDto {
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  orderDate?: string;

  @ApiProperty({ required: false })
  totalAmount?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;
}
