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
import { CreateOrderInputSchema, UpdateOrderInputSchema } from "@crm/shared";
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
import { OrdersService } from "./orders.service";
import { CreateOrderDto, OrderDto, UpdateOrderDto } from "./dto/orders.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("orders")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, OrderDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermissions("order:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(OrderDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.ordersService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("order:write")
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ type: OrderDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateOrderInputSchema.parse(body);
    return this.ordersService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("order:read")
  @ApiOkResponse({ type: OrderDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.ordersService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("order:write")
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({ type: OrderDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateOrderInputSchema.parse(body);
    return this.ordersService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("order:write")
  @ApiOkResponse({ type: OrderDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.ordersService.remove(ctx, id);
  }
}
