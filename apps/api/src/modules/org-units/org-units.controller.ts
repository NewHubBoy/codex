import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags
} from "@nestjs/swagger";
import {
  AddOrgMemberInputSchema,
  CreateOrgUnitInputSchema,
  UpdateOrgUnitInputSchema
} from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { OrgUnitsService } from "./org-units.service";
import {
  AddOrgMemberDto,
  CreateOrgUnitDto,
  OrgMemberDto,
  OrgUnitDto,
  UpdateOrgUnitDto
} from "./dto/org-units.swagger";

@ApiTags("org-units")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("org-units")
export class OrgUnitsController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  @Get("health")
  @Public()
  health() {
    return this.orgUnitsService.health();
  }

  @Get()
  @RequirePermissions("orgunit:read")
  @ApiOkResponse({ type: OrgUnitDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.orgUnitsService.list(ctx);
  }

  @Post()
  @RequirePermissions("orgunit:write")
  @ApiBody({ type: CreateOrgUnitDto })
  @ApiCreatedResponse({ type: OrgUnitDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateOrgUnitInputSchema.parse(body);
    return this.orgUnitsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("orgunit:read")
  @ApiOkResponse({ type: OrgUnitDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.orgUnitsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("orgunit:write")
  @ApiBody({ type: UpdateOrgUnitDto })
  @ApiOkResponse({ type: OrgUnitDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateOrgUnitInputSchema.parse(body);
    return this.orgUnitsService.update(ctx, id, input);
  }

  @Get(":id/members")
  @RequirePermissions("orgunit:read")
  @ApiOkResponse({ type: OrgMemberDto, isArray: true })
  async listMembers(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.orgUnitsService.listMembers(ctx, id);
  }

  @Post(":id/members")
  @RequirePermissions("orgunit:member:write")
  @ApiBody({ type: AddOrgMemberDto })
  @ApiOkResponse({ type: OrgMemberDto })
  async addMember(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = AddOrgMemberInputSchema.parse(body);
    return this.orgUnitsService.addMember(ctx, id, input);
  }

  @Delete(":id/members/:userId")
  @RequirePermissions("orgunit:member:write")
  async removeMember(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("userId") userId: string
  ) {
    const ctx = getRequestContext(req);
    return this.orgUnitsService.removeMember(ctx, id, userId);
  }
}
