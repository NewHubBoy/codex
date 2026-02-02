import { Injectable, NotFoundException } from "@nestjs/common";
import type { AddOrgMemberInput, CreateOrgUnitInput, UpdateOrgUnitInput } from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";
import type { OrgUnitStatus } from "@prisma/client";

@Injectable()
export class OrgUnitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  health() {
    return { status: "ok", module: "org-units" };
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name", "code"]);
    const status = query.status && ["ACTIVE", "INACTIVE"].includes(query.status)
      ? (query.status as OrgUnitStatus)
      : undefined;
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push({ name: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      qFilters.push({ serialId });
    }
    const where = {
      tenantId: ctx.tenantId,
      status,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.orgUnit.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.orgUnit.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const orgUnit = await this.prisma.orgUnit.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!orgUnit) {
      throw new NotFoundException("Org unit not found");
    }
    return orgUnit;
  }

  async create(ctx: RequestContext, input: CreateOrgUnitInput) {
    const orgUnit = await this.prisma.orgUnit.create({
      data: {
        tenantId: ctx.tenantId,
        parentId: input.parentId ?? undefined,
        name: input.name,
        code: input.code,
        type: input.type,
        path: input.path,
        status: input.status ?? "ACTIVE"
      }
    });
    await this.audit.log(ctx, "create", "OrgUnit", orgUnit.id, `Created ${orgUnit.name}`);
    await this.outbox.enqueue(ctx, "OrgUnit", orgUnit.id, "orgunit.created", {
      name: orgUnit.name
    });
    return orgUnit;
  }

  async update(ctx: RequestContext, id: string, input: UpdateOrgUnitInput) {
    await this.get(ctx, id);
    const orgUnit = await this.prisma.orgUnit.update({
      where: { id },
      data: {
        parentId: input.parentId ?? undefined,
        name: input.name,
        code: input.code,
        type: input.type,
        path: input.path,
        status: input.status
      }
    });
    await this.audit.log(ctx, "update", "OrgUnit", orgUnit.id, `Updated ${orgUnit.name}`);
    await this.outbox.enqueue(ctx, "OrgUnit", orgUnit.id, "orgunit.updated", {
      name: orgUnit.name
    });
    return orgUnit;
  }

  async listMembers(ctx: RequestContext, orgUnitId: string) {
    await this.get(ctx, orgUnitId);
    return this.prisma.userOrgMembership.findMany({
      where: {
        orgUnitId,
        user: { tenantId: ctx.tenantId }
      },
      include: { user: true }
    });
  }

  async addMember(ctx: RequestContext, orgUnitId: string, input: AddOrgMemberInput) {
    await this.get(ctx, orgUnitId);
    const user = await this.prisma.user.findFirst({
      where: { id: input.userId, tenantId: ctx.tenantId }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const membership = await this.prisma.userOrgMembership.upsert({
      where: {
        userId_orgUnitId: {
          userId: input.userId,
          orgUnitId
        }
      },
      update: {
        roleInOrg: input.roleInOrg
      },
      create: {
        userId: input.userId,
        orgUnitId,
        roleInOrg: input.roleInOrg
      }
    });
    await this.audit.log(ctx, "update", "UserOrgMembership", `${input.userId}:${orgUnitId}`, "Member added");
    await this.outbox.enqueue(ctx, "OrgUnit", orgUnitId, "orgunit.member.added", {
      userId: input.userId
    });
    return membership;
  }

  async removeMember(ctx: RequestContext, orgUnitId: string, userId: string) {
    await this.get(ctx, orgUnitId);
    const removal = await this.prisma.userOrgMembership.delete({
      where: {
        userId_orgUnitId: {
          userId,
          orgUnitId
        }
      }
    });
    await this.audit.log(ctx, "delete", "UserOrgMembership", `${userId}:${orgUnitId}`, "Member removed");
    await this.outbox.enqueue(ctx, "OrgUnit", orgUnitId, "orgunit.member.removed", {
      userId
    });
    return removal;
  }
}
