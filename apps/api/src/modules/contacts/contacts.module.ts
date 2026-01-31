import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { ContactsController } from "./contacts.controller";
import { ContactsService } from "./contacts.service";

@Module({
  controllers: [ContactsController],
  providers: [
    ContactsService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class ContactsModule {}
