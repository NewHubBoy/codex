import { Module } from "@nestjs/common";
import { DeliveriesController } from "./deliveries.controller";
import { DeliveriesService } from "./deliveries.service";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  controllers: [DeliveriesController],
  providers: [
    DeliveriesService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    NumberingService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class DeliveriesModule {}
