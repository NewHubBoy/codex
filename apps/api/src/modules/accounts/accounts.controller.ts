import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateAccountInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { AccountsService } from "./accounts.service";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.accountsService.list(ctx);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateAccountInputSchema.parse(body);
    return this.accountsService.create(ctx, input);
  }
}
