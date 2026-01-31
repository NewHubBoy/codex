import { ApiProperty } from "@nestjs/swagger";
import { RoleDto } from "../../rbac/dto/rbac.swagger";

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "ACTIVE" })
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateUserDto {
  @ApiProperty({ example: "admin@acme.test" })
  email!: string;

  @ApiProperty({ example: "Admin" })
  name!: string;

  @ApiProperty({ example: "Admin#123" })
  password!: string;

  @ApiProperty({ required: false, example: "ACTIVE" })
  status?: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  password?: string;

  @ApiProperty({ required: false })
  status?: string;
}

export class AssignRoleDto {
  @ApiProperty()
  roleId!: string;
}

export class UserRoleDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  roleId!: string;

  @ApiProperty({ type: RoleDto })
  role!: RoleDto;
}
