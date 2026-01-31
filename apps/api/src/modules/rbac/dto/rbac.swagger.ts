import { ApiProperty } from "@nestjs/swagger";

export class RoleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "SELF" })
  dataScope!: string;

  @ApiProperty({ example: "ACTIVE" })
  status!: string;
}

export class PermissionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "ACTION" })
  type!: string;

  @ApiProperty({ required: false })
  description?: string | null;
}

export class RolePermissionDto {
  @ApiProperty()
  roleId!: string;

  @ApiProperty()
  permissionId!: string;

  @ApiProperty({ type: PermissionDto })
  permission!: PermissionDto;
}

export class CreateRoleDto {
  @ApiProperty({ example: "ADMIN" })
  code!: string;

  @ApiProperty({ example: "Admin" })
  name!: string;

  @ApiProperty({ required: false, example: "ALL" })
  dataScope?: string;

  @ApiProperty({ required: false, example: "ACTIVE" })
  status?: string;
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  dataScope?: string;

  @ApiProperty({ required: false })
  status?: string;
}

export class CreatePermissionDto {
  @ApiProperty({ example: "user:read" })
  code!: string;

  @ApiProperty({ example: "User Read" })
  name!: string;

  @ApiProperty({ required: false, example: "ACTION" })
  type?: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class UpdatePermissionDto {
  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class AssignPermissionDto {
  @ApiProperty()
  permissionId!: string;
}
