import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateContactInputSchema } from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { ContactsService } from "./contacts.service";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.contactsService.list(ctx);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateContactInputSchema.parse(body);
    return this.contactsService.create(ctx, input);
  }
}
