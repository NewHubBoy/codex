import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../request-context";

@Injectable()
export class NumberingService {
  constructor(private readonly prisma: PrismaService) {}

  async next(ctx: RequestContext, objectType: string, opts?: { prefix?: string; format?: string }) {
    const defaultPrefix = opts?.prefix ?? `${objectType.toUpperCase()}-`;
    const defaultFormat = opts?.format ?? "000000";
    const range = await this.prisma.numberRange.upsert({
      where: {
        tenantId_objectType: {
          tenantId: ctx.tenantId,
          objectType
        }
      },
      update: { currentValue: { increment: 1 } },
      create: {
        tenantId: ctx.tenantId,
        objectType,
        prefix: defaultPrefix,
        format: defaultFormat,
        currentValue: 1
      }
    });
    return this.format(range);
  }

  private format(range: { prefix: string | null; currentValue: number; format: string | null }) {
    const padded = range.format
      ? range.currentValue.toString().padStart(range.format.length, "0")
      : range.currentValue.toString();
    return `${range.prefix ?? ""}${padded}`;
  }
}
