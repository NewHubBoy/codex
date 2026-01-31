import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    const required = this.reflector.getAllAndMerge<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.header("x-tenant-id");
    const userId = request.header("x-user-id");
    if (!tenantId || !userId) {
      throw new UnauthorizedException("Missing auth context");
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          tenantId,
          users: { some: { userId } }
        }
      },
      include: {
        permission: true
      }
    });

    const granted = new Set(rolePermissions.map((item) => item.permission.code));
    if (granted.has("crm:full_access")) {
      return true;
    }

    const missing = required.filter((permission) => !granted.has(permission));
    if (missing.length > 0) {
      throw new ForbiddenException("Missing permissions");
    }
    return true;
  }
}
