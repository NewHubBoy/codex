import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { hashPassword, hashToken, hasPasswordHash, verifyPassword } from "../../common/security/password";
import { signJwt, verifyJwt } from "../../common/security/jwt";
import type { AuthTokens } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { status: "ok", module: "auth" };
  }

  async login(tenantId: string, email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, email }
    });
    if (!user || !user.passwordHash || !hasPasswordHash(user.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueTokens(user.id, tenantId);
  }

  async issueTokens(userId: string, tenantId: string): Promise<AuthTokens> {
    const accessTtl = Number.parseInt(process.env.ACCESS_TOKEN_TTL ?? "900", 10);
    const refreshTtl = Number.parseInt(process.env.REFRESH_TOKEN_TTL ?? "2592000", 10);
    const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
    const accessToken = signJwt({ sub: userId, tid: tenantId }, secret, accessTtl);
    const refreshToken = signJwt({ sub: userId, tid: tenantId }, secret, refreshTtl);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashToken(refreshToken) }
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl
    };
  }

  async refresh(tenantId: string, userId: string, refreshToken: string): Promise<AuthTokens> {
    const payload = this.assertRefreshSignature(refreshToken);
    if (payload.sub !== userId || payload.tid !== tenantId) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId }
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    if (hashToken(refreshToken) !== user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return this.issueTokens(user.id, tenantId);
  }

  private assertRefreshSignature(token: string) {
    const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
    const payload = verifyJwt(token, secret);
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return payload;
  }

  async logout(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null }
    });
    return { success: true };
  }

  async setPassword(tenantId: string, userId: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(newPassword) }
    });
    return { success: true };
  }

  async getCurrentUser(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
