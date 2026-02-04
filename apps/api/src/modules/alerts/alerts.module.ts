import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";

@Module({
  controllers: [AlertsController],
  providers: [AlertsService, DataScopeService, AuthGuard, PermissionsGuard]
})
export class AlertsModule {}
