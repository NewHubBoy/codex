import { ApiProperty } from "@nestjs/swagger";

export class BulkStatusResultDto {
  @ApiProperty({ example: 3 })
  updated!: number;

  @ApiProperty({ type: [String], example: ["..."] })
  ids!: string[];
}
