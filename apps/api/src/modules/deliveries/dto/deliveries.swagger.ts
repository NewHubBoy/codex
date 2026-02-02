import { ApiProperty } from "@nestjs/swagger";

const DELIVERY_STATUSES = ["PLANNED", "IN_TRANSIT", "DELIVERED", "COMPLETED"] as const;

export class DeliveryDto {
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
  orderId?: string | null;

  @ApiProperty({ required: false })
  deliveredAt?: string | null;

  @ApiProperty({ required: false })
  deliveryNotes?: string | null;

  @ApiProperty({ required: false })
  deliveredQty?: number | null;
}

export class CreateDeliveryDto {
  @ApiProperty({
    required: false,
    enum: DELIVERY_STATUSES,
    description: "DELIVERED/COMPLETED require orderId, deliveredAt, deliveredQty."
  })
  status?: string;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  orderId?: string | null;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  deliveredAt?: string;

  @ApiProperty({ required: false })
  deliveryNotes?: string;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  deliveredQty?: number;
}

export class UpdateDeliveryDto {
  @ApiProperty({
    required: false,
    enum: DELIVERY_STATUSES,
    description: "DELIVERED/COMPLETED require orderId, deliveredAt, deliveredQty."
  })
  status?: string;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  orderId?: string | null;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  deliveredAt?: string;

  @ApiProperty({ required: false })
  deliveryNotes?: string;

  @ApiProperty({ required: false, description: "Required for DELIVERED/COMPLETED." })
  deliveredQty?: number;
}
