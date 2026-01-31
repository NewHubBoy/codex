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
import { CreateProductInputSchema, UpdateProductInputSchema } from "@crm/shared";
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
import { ProductsService } from "./products.service";
import { CreateProductDto, ProductDto, UpdateProductDto } from "./dto/products.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("products")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, ProductDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions("product:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ProductDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.productsService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("product:write")
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateProductInputSchema.parse(body);
    return this.productsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("product:read")
  @ApiOkResponse({ type: ProductDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.productsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("product:write")
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ type: ProductDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateProductInputSchema.parse(body);
    return this.productsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("product:write")
  @ApiOkResponse({ type: ProductDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.productsService.remove(ctx, id);
  }
}
