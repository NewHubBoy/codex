import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { AttachmentsController } from "./attachments.controller";
import { AttachmentsService } from "./attachments.service";

@Module({
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class AttachmentsModule {}
