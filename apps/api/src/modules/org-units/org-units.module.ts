import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { OrgUnitsController } from "./org-units.controller";
import { OrgUnitsService } from "./org-units.service";

@Module({
  controllers: [OrgUnitsController],
  providers: [OrgUnitsService, AuthGuard, PermissionsGuard],
  exports: [OrgUnitsService]
})
export class OrgUnitsModule {}
