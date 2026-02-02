import { ApiProperty } from "@nestjs/swagger";

const TICKET_STATUSES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED"
] as const;

export class BulkTicketStatusDto {
  @ApiProperty({ type: [String] })
  ids!: string[];

  @ApiProperty({ enum: TICKET_STATUSES })
  status!: string;

  @ApiProperty({ required: false, description: "Validate only; do not write." })
  dryRun?: boolean;
}
