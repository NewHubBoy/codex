import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { verifyJwt } from "../security/jwt";
import { PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = auth.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
    const payload = verifyJwt(token, secret);
    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }
    request.headers["x-tenant-id"] = payload.tid;
    request.headers["x-user-id"] = payload.sub;
    return true;
  }
}
