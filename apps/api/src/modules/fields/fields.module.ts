import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { FieldsController } from "./fields.controller";
import { FieldsService } from "./fields.service";

@Module({
  controllers: [FieldsController],
  providers: [FieldsService, AuditLogService, OutboxService, AuthGuard, PermissionsGuard],
  exports: [FieldsService]
})
export class FieldsModule {}
