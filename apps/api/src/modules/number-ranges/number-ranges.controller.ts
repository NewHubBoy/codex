import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import { CreateNumberRangeInputSchema, UpdateNumberRangeInputSchema } from "@crm/shared";
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
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PaginatedResponseDto } from "../../common/swagger/pagination";
import { NumberRangesService } from "./number-ranges.service";
import {
  CreateNumberRangeDto,
  NextNumberDto,
  NumberRangeDto,
  UpdateNumberRangeDto
} from "./dto/number-ranges.swagger";

@ApiTags("number-ranges")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, NumberRangeDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("number-ranges")
export class NumberRangesController {
  constructor(private readonly numberRangesService: NumberRangesService) {}

  @Get("health")
  @Public()
  health() {
    return { status: "ok", module: "number-ranges" };
  }

  @Get()
  @RequirePermissions("numberrange:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(NumberRangeDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.numberRangesService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("numberrange:write")
  @ApiBody({ type: CreateNumberRangeDto })
  @ApiCreatedResponse({ type: NumberRangeDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateNumberRangeInputSchema.parse(body);
    return this.numberRangesService.create(ctx, input);
  }

  @Patch(":id")
  @RequirePermissions("numberrange:write")
  @ApiBody({ type: UpdateNumberRangeDto })
  @ApiOkResponse({ type: NumberRangeDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateNumberRangeInputSchema.parse(body);
    return this.numberRangesService.update(ctx, id, input);
  }

  @Post(":id/next")
  @RequirePermissions("numberrange:write")
  @ApiOkResponse({ type: NextNumberDto })
  async next(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.numberRangesService.nextNumber(ctx, id);
  }
}
