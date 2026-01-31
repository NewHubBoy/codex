import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthGuard, PermissionsGuard],
  exports: [UsersService]
})
export class UsersModule {}
