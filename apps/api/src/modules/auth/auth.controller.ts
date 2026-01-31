import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { getRequestContext } from "../../common/request-context";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  LoginInputSchema,
  RefreshInputSchema,
  SetPasswordInputSchema
} from "./dto/auth.input";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = LoginInputSchema.parse(body);
    return this.authService.login(ctx.tenantId, input.email, input.password);
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = RefreshInputSchema.parse(body);
    return this.authService.refresh(ctx.tenantId, input.userId, input.refreshToken);
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const ctx = getRequestContext(req);
    if (!ctx.userId) {
      return { success: true };
    }
    return this.authService.logout(ctx.tenantId, ctx.userId);
  }

  @Post("set-password")
  @UseGuards(AuthGuard)
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
