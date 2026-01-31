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
import { CreateContactInputSchema, UpdateContactInputSchema } from "@crm/shared";
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
import { ContactsService } from "./contacts.service";
import { ContactDto, CreateContactDto, UpdateContactDto } from "./dto/contacts.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

@ApiTags("contacts")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, ContactDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions("contact:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(ContactDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.contactsService.list(ctx, listQuery);
  }

  @Post()
  @RequirePermissions("contact:write")
  @ApiBody({ type: CreateContactDto })
  @ApiCreatedResponse({ type: ContactDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateContactInputSchema.parse(body);
    return this.contactsService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("contact:read")
  @ApiOkResponse({ type: ContactDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.contactsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("contact:write")
  @ApiBody({ type: UpdateContactDto })
  @ApiOkResponse({ type: ContactDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateContactInputSchema.parse(body);
    return this.contactsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("contact:write")
  @ApiOkResponse({ type: ContactDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.contactsService.remove(ctx, id);
  }
}
