import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateContactInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags
} from "@nestjs/swagger";
import { ContactsService } from "./contacts.service";
import { ContactDto, CreateContactDto } from "./dto/contacts.swagger";

@ApiTags("contacts")
@ApiBearerAuth()
@ApiSecurity("tenant")
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @RequirePermissions("contact:read")
  @ApiOkResponse({ type: ContactDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.contactsService.list(ctx);
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
}
