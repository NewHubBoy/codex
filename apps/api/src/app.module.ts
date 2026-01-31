import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { OpportunitiesModule } from "./modules/opportunities/opportunities.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { OrgUnitsModule } from "./modules/org-units/org-units.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { TenantMiddleware } from "./common/middleware/tenant.middleware";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantsModule,
    OrgUnitsModule,
    UsersModule,
    RbacModule,
    AccountsModule,
    ContactsModule,
    LeadsModule,
    OpportunitiesModule,
    ActivitiesModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
