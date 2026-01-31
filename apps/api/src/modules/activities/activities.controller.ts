import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateActivityInputSchema } from "@crm/shared";
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
import { ActivitiesService } from "./activities.service";
import { ActivityDto, CreateActivityDto } from "./dto/activities.swagger";

@ApiTags("activities")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequirePermissions("activity:read")
  @ApiOkResponse({ type: ActivityDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.activitiesService.list(ctx);
  }

  @Post()
  @RequirePermissions("activity:write")
  @ApiBody({ type: CreateActivityDto })
  @ApiCreatedResponse({ type: ActivityDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateActivityInputSchema.parse(body);
    return this.activitiesService.create(ctx, input);
  }
}
