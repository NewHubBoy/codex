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
import {
  CreateOrderInputSchema,
  CreateOrderItemInputSchema,
  BulkOrderItemsInputSchema,
  UpdateOrderInputSchema,
  UpdateOrderItemInputSchema,
  SubmitApprovalInputSchema,
  ResubmitApprovalInputSchema
} from "@crm/shared";
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
import {
  CreateOrderItemDto,
  BulkOrderItemsDto,
  OrderItemDto,
  UpdateOrderItemDto
} from "./dto/order-items.swagger";

@ApiTags("orders")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, OrderDto, OrderItemDto)
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

  @Post(":id/submit-approval")
  @RequirePermissions("order:write")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        payload: { type: "object" }
      }
    }
  })
  @ApiOkResponse({ type: OrderDto })
  async submitApproval(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = SubmitApprovalInputSchema.parse(body);
    return this.ordersService.submitForApproval(ctx, id, input.payload);
  }

  @Post(":id/resubmit")
  @RequirePermissions("order:write")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        payload: { type: "object" }
      }
    }
  })
  @ApiOkResponse({ type: OrderDto })
  async resubmit(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = ResubmitApprovalInputSchema.parse(body);
    return this.ordersService.resubmitForApproval(ctx, id, input.payload);
  }

  @Delete(":id")
  @RequirePermissions("order:write")
  @ApiOkResponse({ type: OrderDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.ordersService.remove(ctx, id);
  }

  @Get(":id/items")
  @RequirePermissions("order:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(OrderItemDto) }
            }
          }
        }
      ]
    }
  })
  async listItems(
    @Req() req: Request,
    @Param("id") id: string,
    @Query() query: Record<string, string>
  ) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.ordersService.listItems(ctx, id, listQuery);
  }

  @Post(":id/items")
  @RequirePermissions("order:write")
  @ApiBody({ type: CreateOrderItemDto })
  @ApiCreatedResponse({ type: OrderItemDto })
  async addItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = CreateOrderItemInputSchema.parse(body);
    return this.ordersService.addItem(ctx, id, input);
  }

  @Post(":id/items/bulk")
  @RequirePermissions("order:write")
  @ApiBody({ type: BulkOrderItemsDto })
  @ApiCreatedResponse({ type: OrderItemDto, isArray: true })
  async addItemsBulk(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = BulkOrderItemsInputSchema.parse(body);
    return this.ordersService.addItemsBulk(ctx, id, input);
  }

  @Patch(":id/items/:itemId")
  @RequirePermissions("order:write")
  @ApiBody({ type: UpdateOrderItemDto })
  @ApiOkResponse({ type: OrderItemDto })
  async updateItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = UpdateOrderItemInputSchema.parse(body);
    return this.ordersService.updateItem(ctx, id, itemId, input);
  }

  @Delete(":id/items/:itemId")
  @RequirePermissions("order:write")
  @ApiOkResponse({ type: OrderItemDto })
  async removeItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("itemId") itemId: string
  ) {
    const ctx = getRequestContext(req);
    return this.ordersService.removeItem(ctx, id, itemId);
  }
}
