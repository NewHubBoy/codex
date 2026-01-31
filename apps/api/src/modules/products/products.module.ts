import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    DataScopeService,
    AuditLogService,
    OutboxService,
    AuthGuard,
    PermissionsGuard
  ]
})
export class ProductsModule {}
