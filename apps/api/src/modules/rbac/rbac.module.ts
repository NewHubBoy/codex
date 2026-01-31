import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";

@Module({
  controllers: [RbacController],
  providers: [RbacService, AuditLogService, OutboxService, AuthGuard, PermissionsGuard],
  exports: [RbacService]
})
export class RbacModule {}
