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
import { CreateActivityInputSchema, UpdateActivityInputSchema } from "@crm/shared";
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
import { ActivitiesService } from "./activities.service";
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from "./dto/activities.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("activities")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, ActivityDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequirePermissions("activity:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ActivityDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.activitiesService.list(ctx, listQuery);
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

  @Get(":id")
  @RequirePermissions("activity:read")
  @ApiOkResponse({ type: ActivityDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.activitiesService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("activity:write")
  @ApiBody({ type: UpdateActivityDto })
  @ApiOkResponse({ type: ActivityDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateActivityInputSchema.parse(body);
    return this.activitiesService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("activity:write")
  @ApiOkResponse({ type: ActivityDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.activitiesService.remove(ctx, id);
  }
}
