import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
  @ApiProperty({ example: "admin@acme.test" })
  email!: string;

  @ApiProperty({ example: "Admin#123" })
  password!: string;
}

export class RefreshRequestDto {
  @ApiProperty({ example: "00000000-0000-0000-0000-000000000003" })
  userId!: string;

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  refreshToken!: string;
}

export class SetPasswordRequestDto {
  @ApiProperty({ example: "00000000-0000-0000-0000-000000000003" })
  userId!: string;

  @ApiProperty({ example: "NewPass#123" })
  password!: string;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;
}
