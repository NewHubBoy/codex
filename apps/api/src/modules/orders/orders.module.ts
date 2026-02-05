import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { ApprovalsModule } from "../approvals/approvals.module";

@Module({
  imports: [ApprovalsModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    NumberingService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class OrdersModule {}
