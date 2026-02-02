import { ApiProperty } from "@nestjs/swagger";

const LEAD_STATUSES = [
  "NEW",
  "ASSIGNED",
  "WORKING",
  "QUALIFIED",
  "CONVERTED",
  "DISQUALIFIED"
] as const;

export class BulkLeadStatusDto {
  @ApiProperty({ type: [String] })
  ids!: string[];

  @ApiProperty({ enum: LEAD_STATUSES })
  status!: string;

  @ApiProperty({ required: false, description: "Validate only; do not write." })
  dryRun?: boolean;

  @ApiProperty({ required: false, description: "Optional. Applied to all items if provided." })
  accountId?: string | null;

  @ApiProperty({ required: false, description: "Optional. Applied to all items if provided." })
  contactId?: string | null;
}
