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
import { CreateLeadInputSchema, UpdateLeadInputSchema } from "@crm/shared";
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
import { LeadsService } from "./leads.service";
import { CreateLeadDto, LeadDto, UpdateLeadDto } from "./dto/leads.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("leads")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, LeadDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @RequirePermissions("lead:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(LeadDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.leadsService.list(ctx, listQuery);
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

  @Get(":id")
  @RequirePermissions("lead:read")
  @ApiOkResponse({ type: LeadDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.leadsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("lead:write")
  @ApiBody({ type: UpdateLeadDto })
  @ApiOkResponse({ type: LeadDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateLeadInputSchema.parse(body);
    return this.leadsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("lead:write")
  @ApiOkResponse({ type: LeadDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.leadsService.remove(ctx, id);
  }
}
