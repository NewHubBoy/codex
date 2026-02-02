import { ApiProperty } from "@nestjs/swagger";

const ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "IN_FULFILLMENT",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "CLOSED",
  "CANCELLED"
] as const;

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
  @ApiProperty({
    required: false,
    enum: ORDER_STATUSES,
    description:
      "CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED require accountId, orderDate, totalAmount, currency."
  })
  status?: string;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  orderDate?: string;

  @ApiProperty({
    required: false,
    description:
      "If omitted, totalAmount is recomputed from items. Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  totalAmount?: number;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  currency?: string;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;
}

export class UpdateOrderDto {
  @ApiProperty({
    required: false,
    enum: ORDER_STATUSES,
    description:
      "CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED require accountId, orderDate, totalAmount, currency."
  })
  status?: string;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  orderDate?: string;

  @ApiProperty({
    required: false,
    description:
      "If omitted, totalAmount is recomputed from items. Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  totalAmount?: number;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  currency?: string;

  @ApiProperty({
    required: false,
    description: "Required for CONFIRMED/IN_FULFILLMENT/PARTIALLY_DELIVERED/DELIVERED/CLOSED."
  })
  accountId?: string | null;

  @ApiProperty({ required: false })
  contactId?: string | null;

  @ApiProperty({ required: false })
  opportunityId?: string | null;
}
