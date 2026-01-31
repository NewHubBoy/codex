import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateAccountInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags
} from "@nestjs/swagger";
import { AccountsService } from "./accounts.service";
import { AccountDto, CreateAccountDto } from "./dto/accounts.swagger";

@ApiTags("accounts")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @RequirePermissions("account:read")
  @ApiOkResponse({ type: AccountDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.accountsService.list(ctx);
  }

  @Post()
  @RequirePermissions("account:write")
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({ type: AccountDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateAccountInputSchema.parse(body);
    return this.accountsService.create(ctx, input);
  }
}
