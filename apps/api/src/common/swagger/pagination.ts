import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  pageSize!: number;

  @ApiProperty({ example: 123 })
  total!: number;
}
