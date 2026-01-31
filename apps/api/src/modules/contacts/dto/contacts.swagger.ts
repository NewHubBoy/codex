import { ApiProperty } from "@nestjs/swagger";

export class ContactDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  accountId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  title?: string | null;

  @ApiProperty({ required: false })
  email?: string | null;

  @ApiProperty({ required: false })
  phone?: string | null;

  @ApiProperty({ required: false })
  role?: string | null;
}

export class CreateContactDto {
  @ApiProperty()
  accountId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  bpId?: string | null;
}
