import { ApiProperty } from "@nestjs/swagger";

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
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  orderId?: string | null;

  @ApiProperty({ required: false })
  deliveredAt?: string;

  @ApiProperty({ required: false })
  deliveryNotes?: string;

  @ApiProperty({ required: false })
  deliveredQty?: number;
}

export class UpdateDeliveryDto {
  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  orderId?: string | null;

  @ApiProperty({ required: false })
  deliveredAt?: string;

  @ApiProperty({ required: false })
  deliveryNotes?: string;

  @ApiProperty({ required: false })
  deliveredQty?: number;
}
