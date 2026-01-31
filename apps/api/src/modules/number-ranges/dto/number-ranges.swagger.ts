import { ApiProperty } from "@nestjs/swagger";

export class NumberRangeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  objectType!: string;

  @ApiProperty({ required: false })
  prefix?: string | null;

  @ApiProperty()
  currentValue!: number;

  @ApiProperty({ required: false })
  format?: string | null;

  @ApiProperty({ required: false })
  resetRule?: string | null;
}

export class CreateNumberRangeDto {
  @ApiProperty()
  objectType!: string;

  @ApiProperty({ required: false })
  prefix?: string;

  @ApiProperty({ required: false })
  currentValue?: number;

  @ApiProperty({ required: false })
  format?: string;

  @ApiProperty({ required: false })
  resetRule?: string;
}

export class UpdateNumberRangeDto {
  @ApiProperty({ required: false })
  objectType?: string;

  @ApiProperty({ required: false })
  prefix?: string;

  @ApiProperty({ required: false })
  currentValue?: number;

  @ApiProperty({ required: false })
  format?: string;

  @ApiProperty({ required: false })
  resetRule?: string;
}

export class NextNumberDto {
  @ApiProperty()
  value!: number;

  @ApiProperty()
  formatted!: string;
}
