import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateOpportunityInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { OpportunitiesService } from "./opportunities.service";

@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.opportunitiesService.list(ctx);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateOpportunityInputSchema.parse(body);
    return this.opportunitiesService.create(ctx, input);
  }
}
