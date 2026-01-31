import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { OrgUnitsController } from "./org-units.controller";
import { OrgUnitsService } from "./org-units.service";

@Module({
  controllers: [OrgUnitsController],
  providers: [OrgUnitsService, AuditLogService, OutboxService, AuthGuard, PermissionsGuard],
  exports: [OrgUnitsService]
})
export class OrgUnitsModule {}
