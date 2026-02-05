import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { OpportunitiesModule } from "./modules/opportunities/opportunities.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { AttachmentsModule } from "./modules/attachments/attachments.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
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
import { ApprovalsModule } from "./modules/approvals/approvals.module";
import { TenantMiddleware } from "./common/middleware/tenant.middleware";
import { I18nModule } from "./common/i18n/i18n.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    PrismaModule,
    I18nModule,
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
    AlertsModule,
    AttachmentsModule,
    ProductsModule,
    QuotesModule,
    OrdersModule,
    DeliveriesModule,
    TicketsModule,
    NumberRangesModule,
    WorkflowsModule,
    FieldsModule,
    ApprovalsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
