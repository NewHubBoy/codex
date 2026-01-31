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
import { CreateDeliveryInputSchema, UpdateDeliveryInputSchema } from "@crm/shared";
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
import { DeliveriesService } from "./deliveries.service";
import { CreateDeliveryDto, DeliveryDto, UpdateDeliveryDto } from "./dto/deliveries.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("deliveries")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, DeliveryDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("deliveries")
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @RequirePermissions("delivery:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(DeliveryDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.deliveriesService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("delivery:write")
  @ApiBody({ type: CreateDeliveryDto })
  @ApiCreatedResponse({ type: DeliveryDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateDeliveryInputSchema.parse(body);
    return this.deliveriesService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("delivery:read")
  @ApiOkResponse({ type: DeliveryDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.deliveriesService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("delivery:write")
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiOkResponse({ type: DeliveryDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateDeliveryInputSchema.parse(body);
    return this.deliveriesService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("delivery:write")
  @ApiOkResponse({ type: DeliveryDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.deliveriesService.remove(ctx, id);
  }
}
