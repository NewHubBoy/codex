import { ApiProperty } from "@nestjs/swagger";

export class AccountDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  orgUnitId?: string | null;

  @ApiProperty({ required: false })
  ownerId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  type?: string | null;

  @ApiProperty({ required: false })
  industry?: string | null;

  @ApiProperty({ required: false })
  rating?: string | null;

  @ApiProperty({ required: false })
  lifecycleStatus?: string | null;
}

export class CreateAccountDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  industry?: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  lifecycleStatus?: string;

  @ApiProperty({ required: false })
  parentId?: string | null;

  @ApiProperty({ required: false })
  bpId?: string | null;
}

export class UpdateAccountDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  industry?: string;

  @ApiProperty({ required: false })
  rating?: string;

  @ApiProperty({ required: false })
  lifecycleStatus?: string;

  @ApiProperty({ required: false })
  parentId?: string | null;

  @ApiProperty({ required: false })
  bpId?: string | null;
}
