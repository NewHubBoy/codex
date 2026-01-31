import { Injectable } from "@nestjs/common";
import type { CreateContactInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ctx: RequestContext, input: CreateContactInput) {
    return this.prisma.contact.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        accountId: input.accountId,
        name: input.name,
        title: input.title,
        email: input.email,
        phone: input.phone,
        role: input.role,
        bpId: input.bpId ?? undefined
      }
    });
  }

  async list(ctx: RequestContext) {
    return this.prisma.contact.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }
}
