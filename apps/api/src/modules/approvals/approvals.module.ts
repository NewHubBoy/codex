import { Module } from "@nestjs/common";
import { ApprovalsController } from "./approvals.controller";
import { ApprovalRulesController } from "./approval-rules.controller";
import { ApprovalsService } from "./approvals.service";
import { ApprovalRulesService } from "./approval-rules.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  controllers: [ApprovalsController, ApprovalRulesController],
  providers: [
    ApprovalsService,
    ApprovalRulesService,
    AuditLogService,
    OutboxService,
    AuthGuard,
    PermissionsGuard
  ],
  exports: [ApprovalsService, ApprovalRulesService]
})
export class ApprovalsModule {}
