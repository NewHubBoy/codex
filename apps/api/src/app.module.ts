import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { OpportunitiesModule } from "./modules/opportunities/opportunities.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { AttachmentsModule } from "./modules/attachments/attachments.module";
import { ProductsModule } from "./modules/products/products.module";
import { QuotesModule } from "./modules/quotes/quotes.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { DeliveriesModule } from "./modules/deliveries/deliveries.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { OrgUnitsModule } from "./modules/org-units/org-units.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { NumberRangesModule } from "./modules/number-ranges/number-ranges.module";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import { FieldsModule } from "./modules/fields/fields.module";
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
    ActivitiesModule,
    AttachmentsModule,
    ProductsModule,
    QuotesModule,
    OrdersModule,
    DeliveriesModule,
    TicketsModule,
    NumberRangesModule,
    WorkflowsModule,
    FieldsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
