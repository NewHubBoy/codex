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
  CreateQuoteInputSchema,
  CreateQuoteItemInputSchema,
  BulkQuoteItemsInputSchema,
  UpdateQuoteInputSchema,
  UpdateQuoteItemInputSchema
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
import { QuotesService } from "./quotes.service";
import { CreateQuoteDto, QuoteDto, UpdateQuoteDto } from "./dto/quotes.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";
import {
  CreateQuoteItemDto,
  BulkQuoteItemsDto,
  QuoteItemDto,
  UpdateQuoteItemDto
} from "./dto/quote-items.swagger";

@ApiTags("quotes")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, QuoteDto, QuoteItemDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @RequirePermissions("quote:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(QuoteDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.quotesService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("quote:write")
  @ApiBody({ type: CreateQuoteDto })
  @ApiCreatedResponse({ type: QuoteDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateQuoteInputSchema.parse(body);
    return this.quotesService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("quote:read")
  @ApiOkResponse({ type: QuoteDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.quotesService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("quote:write")
  @ApiBody({ type: UpdateQuoteDto })
  @ApiOkResponse({ type: QuoteDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateQuoteInputSchema.parse(body);
    return this.quotesService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("quote:write")
  @ApiOkResponse({ type: QuoteDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.quotesService.remove(ctx, id);
  }

  @Get(":id/items")
  @RequirePermissions("quote:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(QuoteItemDto) }
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
    return this.quotesService.listItems(ctx, id, listQuery);
  }

  @Post(":id/items")
  @RequirePermissions("quote:write")
  @ApiBody({ type: CreateQuoteItemDto })
  @ApiCreatedResponse({ type: QuoteItemDto })
  async addItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = CreateQuoteItemInputSchema.parse(body);
    return this.quotesService.addItem(ctx, id, input);
  }

  @Post(":id/items/bulk")
  @RequirePermissions("quote:write")
  @ApiBody({ type: BulkQuoteItemsDto })
  @ApiCreatedResponse({ type: QuoteItemDto, isArray: true })
  async addItemsBulk(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = BulkQuoteItemsInputSchema.parse(body);
    return this.quotesService.addItemsBulk(ctx, id, input);
  }

  @Patch(":id/items/:itemId")
  @RequirePermissions("quote:write")
  @ApiBody({ type: UpdateQuoteItemDto })
  @ApiOkResponse({ type: QuoteItemDto })
  async updateItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = UpdateQuoteItemInputSchema.parse(body);
    return this.quotesService.updateItem(ctx, id, itemId, input);
  }

  @Delete(":id/items/:itemId")
  @RequirePermissions("quote:write")
  @ApiOkResponse({ type: QuoteItemDto })
  async removeItem(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("itemId") itemId: string
  ) {
    const ctx = getRequestContext(req);
    return this.quotesService.removeItem(ctx, id, itemId);
  }
}
