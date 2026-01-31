import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateLeadInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { LeadsService } from "./leads.service";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.leadsService.list(ctx);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateLeadInputSchema.parse(body);
    return this.leadsService.create(ctx, input);
  }
}
