import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateOpportunityInputSchema } from "@crm/shared";
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
import { OpportunitiesService } from "./opportunities.service";
import { CreateOpportunityDto, OpportunityDto } from "./dto/opportunities.swagger";

@ApiTags("opportunities")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  @RequirePermissions("opportunity:read")
  @ApiOkResponse({ type: OpportunityDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.opportunitiesService.list(ctx);
  }

  @Post()
  @RequirePermissions("opportunity:write")
  @ApiBody({ type: CreateOpportunityDto })
  @ApiCreatedResponse({ type: OpportunityDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateOpportunityInputSchema.parse(body);
    return this.opportunitiesService.create(ctx, input);
  }
}
