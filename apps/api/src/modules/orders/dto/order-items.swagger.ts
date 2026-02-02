import { ApiProperty } from "@nestjs/swagger";

export class OrderItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty({ required: false })
  productId?: string | null;

  @ApiProperty({ required: false })
  qty?: number | null;

  @ApiProperty({ required: false })
  unitPrice?: number | null;

  @ApiProperty({ required: false })
  discount?: number | null;

  @ApiProperty({ required: false })
  tax?: number | null;

  @ApiProperty({ required: false })
  lineTotal?: number | null;
}

export class CreateOrderItemDto {
  @ApiProperty({ required: false })
  productId?: string | null;

  @ApiProperty({ required: false })
  qty?: number;

  @ApiProperty({ required: false })
  unitPrice?: number;

  @ApiProperty({ required: false })
  discount?: number;

  @ApiProperty({ required: false })
  tax?: number;

  @ApiProperty({ required: false })
  lineTotal?: number;
}

export class UpdateOrderItemDto {
  @ApiProperty({ required: false })
  productId?: string | null;

  @ApiProperty({ required: false })
  qty?: number;

  @ApiProperty({ required: false })
  unitPrice?: number;

  @ApiProperty({ required: false })
  discount?: number;

  @ApiProperty({ required: false })
  tax?: number;

  @ApiProperty({ required: false })
  lineTotal?: number;
}

export class BulkOrderItemsDto {
  @ApiProperty({ required: false, enum: ["append", "replace"] })
  mode?: "append" | "replace";

  @ApiProperty({ type: [CreateOrderItemDto] })
  items!: CreateOrderItemDto[];
}
