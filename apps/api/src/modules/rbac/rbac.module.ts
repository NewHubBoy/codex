import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";

@Module({
  controllers: [RbacController],
  providers: [RbacService, AuthGuard, PermissionsGuard],
  exports: [RbacService]
})
export class RbacModule {}
