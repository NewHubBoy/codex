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
import { CreateQuoteInputSchema, UpdateQuoteInputSchema } from "@crm/shared";
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

@ApiTags("quotes")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, QuoteDto)
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
}
