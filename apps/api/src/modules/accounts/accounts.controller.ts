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
import { CreateAccountInputSchema, UpdateAccountInputSchema } from "@crm/shared";
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
import { AccountsService } from "./accounts.service";
import { AccountDto, CreateAccountDto, UpdateAccountDto } from "./dto/accounts.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("accounts")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, AccountDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @RequirePermissions("account:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(AccountDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.accountsService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("account:write")
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({ type: AccountDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateAccountInputSchema.parse(body);
    return this.accountsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("account:read")
  @ApiOkResponse({ type: AccountDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.accountsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("account:write")
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateAccountInputSchema.parse(body);
    return this.accountsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("account:write")
  @ApiOkResponse({ type: AccountDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.accountsService.remove(ctx, id);
  }
}
