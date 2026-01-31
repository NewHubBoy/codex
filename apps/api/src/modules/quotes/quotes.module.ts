import { Module } from "@nestjs/common";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  controllers: [QuotesController],
  providers: [
    QuotesService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    NumberingService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class QuotesModule {}
