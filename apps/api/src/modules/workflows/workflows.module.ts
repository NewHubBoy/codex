import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowsService } from "./workflows.service";

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowsService, AuditLogService, OutboxService, AuthGuard, PermissionsGuard],
  exports: [WorkflowsService]
})
export class WorkflowsModule {}
