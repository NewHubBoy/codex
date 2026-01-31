import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateActivityInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { ActivitiesService } from "./activities.service";

@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.activitiesService.list(ctx);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateActivityInputSchema.parse(body);
    return this.activitiesService.create(ctx, input);
  }
}
