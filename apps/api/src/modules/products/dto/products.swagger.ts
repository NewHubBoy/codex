import { ApiProperty } from "@nestjs/swagger";

const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export class ProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty({ required: false })
  sku?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  category?: string | null;

  @ApiProperty({ required: false })
  listPrice?: number | null;

  @ApiProperty({ required: false })
  currency?: string | null;
}

export class CreateProductDto {
  @ApiProperty({ required: false })
  sku?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  listPrice?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false, enum: PRODUCT_STATUSES })
  status?: string;
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  sku?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  listPrice?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false, enum: PRODUCT_STATUSES })
  status?: string;
}
