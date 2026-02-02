import { ApiProperty } from "@nestjs/swagger";

export class QuoteItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  quoteId!: string;

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

export class CreateQuoteItemDto {
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

export class UpdateQuoteItemDto {
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

export class BulkQuoteItemsDto {
  @ApiProperty({ required: false, enum: ["append", "replace"] })
  mode?: "append" | "replace";

  @ApiProperty({ type: [CreateQuoteItemDto] })
  items!: CreateQuoteItemDto[];
}
