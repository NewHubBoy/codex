import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";

@Module({
  controllers: [AccountsController],
  providers: [
    AccountsService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class AccountsModule {}
