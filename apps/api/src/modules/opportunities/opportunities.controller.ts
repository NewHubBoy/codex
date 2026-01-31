import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import { CreateOpportunityInputSchema, UpdateOpportunityInputSchema } from "@crm/shared";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import { OpportunitiesService } from "./opportunities.service";
import { CreateOpportunityDto, OpportunityDto, UpdateOpportunityDto } from "./dto/opportunities.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("opportunities")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, OpportunityDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  @RequirePermissions("opportunity:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(OpportunityDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.opportunitiesService.list(ctx, listQuery);
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

  @Get(":id")
  @RequirePermissions("opportunity:read")
  @ApiOkResponse({ type: OpportunityDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.opportunitiesService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("opportunity:write")
  @ApiBody({ type: UpdateOpportunityDto })
  @ApiOkResponse({ type: OpportunityDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateOpportunityInputSchema.parse(body);
    return this.opportunitiesService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("opportunity:write")
  @ApiOkResponse({ type: OpportunityDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.opportunitiesService.remove(ctx, id);
  }
}
