import { ApiProperty } from "@nestjs/swagger";

export class OrgUnitDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  parentId?: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  code?: string | null;

  @ApiProperty({ required: false })
  type?: string | null;

  @ApiProperty({ required: false })
  path?: string | null;

  @ApiProperty({ example: "ACTIVE" })
  status!: string;
}

export class CreateOrgUnitDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  path?: string;

  @ApiProperty({ required: false })
  parentId?: string | null;

  @ApiProperty({ required: false, example: "ACTIVE" })
  status?: string;
}

export class UpdateOrgUnitDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  path?: string;

  @ApiProperty({ required: false })
  parentId?: string | null;

  @ApiProperty({ required: false })
  status?: string;
}

export class AddOrgMemberDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ required: false })
  roleInOrg?: string;
}

export class OrgMemberDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  orgUnitId!: string;

  @ApiProperty({ required: false })
  roleInOrg?: string | null;

  @ApiProperty({
    example: {
      id: "00000000-0000-0000-0000-000000000003",
      email: "admin@acme.test",
      name: "Admin"
    }
  })
  user!: {
    id: string;
    email: string;
    name: string;
  };
}
