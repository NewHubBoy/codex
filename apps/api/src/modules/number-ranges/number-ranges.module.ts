import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberRangesController } from "./number-ranges.controller";
import { NumberRangesService } from "./number-ranges.service";

@Module({
  controllers: [NumberRangesController],
  providers: [NumberRangesService, AuditLogService, OutboxService, AuthGuard, PermissionsGuard],
  exports: [NumberRangesService]
})
export class NumberRangesModule {}
