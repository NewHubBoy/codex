import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { ApiBody, ApiOkResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { getRequestContext } from "../../common/request-context";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  LoginInputSchema,
  RefreshInputSchema,
  SetPasswordInputSchema
} from "./dto/auth.input";
import { AuthService } from "./auth.service";
import {
  AuthTokensDto,
  LoginRequestDto,
  RefreshRequestDto,
  SetPasswordRequestDto
} from "./dto/auth.swagger";

@ApiTags("auth")
@ApiSecurity("tenant")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: AuthTokensDto })
  async login(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = LoginInputSchema.parse(body);
    return this.authService.login(
      ctx.tenantId,
      input.email,
      input.password,
      input.locale
    );
  }

  @Post("refresh")
  @ApiBody({ type: RefreshRequestDto })
  @ApiOkResponse({ type: AuthTokensDto })
  async refresh(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = RefreshInputSchema.parse(body);
    return this.authService.refresh(ctx.tenantId, input.userId, input.refreshToken);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  @ApiOkResponse({ schema: { example: { id: "...", name: "...", email: "..." } } })
  async getCurrentUser(@Req() req: Request) {
    const ctx = getRequestContext(req);
    if (!ctx.userId) {
      throw new Error("User ID not found in request context");
    }
    return this.authService.getCurrentUser(ctx.tenantId, ctx.userId);
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  @ApiOkResponse({ schema: { example: { success: true } } })
  async logout(@Req() req: Request) {
    const ctx = getRequestContext(req);
    if (!ctx.userId) {
      return { success: true };
    }
    return this.authService.logout(ctx.tenantId, ctx.userId);
  }

  @Post("set-password")
  @UseGuards(AuthGuard)
  @ApiBody({ type: SetPasswordRequestDto })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async setPassword(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = SetPasswordInputSchema.parse(body);
    return this.authService.setPassword(ctx.tenantId, input.userId, input.password);
  }

  @Get("health")
  health() {
    return this.authService.health();
  }
}
