import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './database/data-source';
import { NullTransformInterceptor } from './interceptors/transform-response.interceptor';
import { AddressModule } from './modules/address/address.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannerModule } from './modules/banner/banner.module';
import { BranchModule } from './modules/branch/branch.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/categories/category.module';
import { CompanyModule } from './modules/company/company.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { LabelModule } from './modules/label/label.module';
import { LanguageModule } from './modules/language/language.module';
import { MobileApiModule } from './modules/mobileapi/mobileapi.module';
import { ModulesModule } from './modules/module/module.module';
import { NotesModule } from './modules/notes/note.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PriceContentModule } from './modules/price-content/price-content.module';
import { PriceModule } from './modules/price/price.module';
import { ProductModule } from './modules/products/product.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';
import { RoleModule } from './modules/role/role.module';
import { ServicesModule } from './modules/services/services.module';
import { SettingModule } from './modules/settings/setting.module';
import { UsersModule } from './modules/user/user.module';
import { IsUniqueConstraint } from './modules/validator/is-unique-constarint';
import { BenefitModule } from './modules/web-contents/benefits/benefits.module';
import { CorporateServiceModule } from './modules/web-contents/corporate-services/corporate-service.module';
import { LaundryBranchModule } from './modules/web-contents/laundry-branch/laundry-branch.module';
import { LaundryHistoryModule } from './modules/web-contents/laundry-history/laundry-history.module';
import { LaundryServicesModule } from './modules/web-contents/laundry-services/laundry-services.module';
import { OurPriceModule } from './modules/web-contents/our-prices/our-prices.module';
import { OurServiceModule } from './modules/web-contents/our-services/our-service.module';
import { ServiceListModule } from './modules/web-contents/service-list/service-list.module';
import { WelcomeModule } from './modules/web-contents/welcome/welcome.module';
import { WhyChooseUsModule } from './modules/web-contents/why-choose-us/why-choose-us.module';
import { WebModule } from './modules/web/web.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { MorganMiddleware } from './morgan.middleware';
import { RazorpayModule } from './razorpay/razorpay.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    AddressModule,
    CategoryModule,
    ProductModule,
    ServicesModule,
    PriceModule,
    BannerModule,
    SettingModule,
    OrderModule,
    CouponModule,
    CompanyModule,
    BranchModule,
    NotesModule,
    MobileApiModule,
    CartModule,
    NotificationModule,
    InvoiceModule,
    WebModule,
    FeedbackModule,
    ReportModule,
    WorkshopModule,
    ContactUsModule,
    PriceContentModule,
    RazorpayModule,
    ModulesModule,
    RoleModule,
    RolePermissionModule,
    HttpModule,
    LanguageModule,
    LabelModule,
    ServiceListModule,
    WhyChooseUsModule,
    BenefitModule,
    LaundryServicesModule,
    CorporateServiceModule,
    LaundryHistoryModule,
    LaundryBranchModule,
    WelcomeModule,
    OurServiceModule,
    OurPriceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: NullTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
