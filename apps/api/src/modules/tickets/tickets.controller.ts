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
import { CreateTicketInputSchema, UpdateTicketInputSchema } from "@crm/shared";
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
import { TicketsService } from "./tickets.service";
import { CreateTicketDto, TicketDto, UpdateTicketDto } from "./dto/tickets.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("tickets")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, TicketDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @RequirePermissions("ticket:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(TicketDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.ticketsService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("ticket:write")
  @ApiBody({ type: CreateTicketDto })
  @ApiCreatedResponse({ type: TicketDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateTicketInputSchema.parse(body);
    return this.ticketsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("ticket:read")
  @ApiOkResponse({ type: TicketDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.ticketsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("ticket:write")
  @ApiBody({ type: UpdateTicketDto })
  @ApiOkResponse({ type: TicketDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateTicketInputSchema.parse(body);
    return this.ticketsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("ticket:write")
  @ApiOkResponse({ type: TicketDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.ticketsService.remove(ctx, id);
  }
}
