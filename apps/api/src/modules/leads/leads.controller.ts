import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateLeadInputSchema } from "@crm/shared";
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
import { LeadsService } from "./leads.service";
import { CreateLeadDto, LeadDto } from "./dto/leads.swagger";

@ApiTags("leads")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequirePermissions("lead:read")
  @ApiOkResponse({ type: LeadDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.leadsService.list(ctx);
  }

  @Post()
  @RequirePermissions("lead:write")
  @ApiBody({ type: CreateLeadDto })
  @ApiCreatedResponse({ type: LeadDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateLeadInputSchema.parse(body);
    return this.leadsService.create(ctx, input);
  }
}
