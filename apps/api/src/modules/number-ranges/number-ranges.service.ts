import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateNumberRangeInput, UpdateNumberRangeInput } from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

@Injectable()
export class NumberRangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async list(ctx: RequestContext) {
    return this.prisma.numberRange.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }

  async get(ctx: RequestContext, id: string) {
    const range = await this.prisma.numberRange.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!range) {
      throw new NotFoundException("Number range not found");
    }
    return range;
  }

  async create(ctx: RequestContext, input: CreateNumberRangeInput) {
    const range = await this.prisma.numberRange.create({
      data: {
        tenantId: ctx.tenantId,
        objectType: input.objectType,
        prefix: input.prefix,
        currentValue: input.currentValue ?? 0,
        format: input.format,
        resetRule: input.resetRule
      }
    });
    await this.audit.log(ctx, "create", "NumberRange", range.id, `Created ${range.objectType}`);
    await this.outbox.enqueue(ctx, "NumberRange", range.id, "number_range.created", {
      objectType: range.objectType
    });
    return range;
  }

  async update(ctx: RequestContext, id: string, input: UpdateNumberRangeInput) {
    await this.get(ctx, id);
    const range = await this.prisma.numberRange.update({
      where: { id },
      data: {
        objectType: input.objectType,
        prefix: input.prefix,
        currentValue: input.currentValue,
        format: input.format,
        resetRule: input.resetRule
      }
    });
    await this.audit.log(ctx, "update", "NumberRange", range.id, `Updated ${range.objectType}`);
    await this.outbox.enqueue(ctx, "NumberRange", range.id, "number_range.updated", {
      objectType: range.objectType
    });
    return range;
  }

  async nextNumber(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const range = await this.prisma.numberRange.update({
      where: { id },
      data: { currentValue: { increment: 1 } }
    });
    const formatted = this.format(range);
    await this.audit.log(ctx, "update", "NumberRange", range.id, `Next number ${formatted}`);
    await this.outbox.enqueue(ctx, "NumberRange", range.id, "number_range.next", {
      value: range.currentValue,
      formatted
    });
    return { value: range.currentValue, formatted };
  }

  private format(range: { prefix: string | null; currentValue: number; format: string | null }) {
    const padded = range.format
      ? range.currentValue.toString().padStart(range.format.length, "0")
      : range.currentValue.toString();
    return `${range.prefix ?? ""}${padded}`;
  }
}
