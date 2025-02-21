import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { MobileApiModule } from './modules/mobileapi/mobileapi.module';
import { ModulesModule } from './modules/module/module.module';
import { NotesModule } from './modules/notes/note.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PriceContentModule } from './modules/price-content/price-content.module';
import { PriceModule } from './modules/price/price.module';
import { ProductModule } from './modules/products/product.module';
import { RoleModule } from './modules/role/role.module';
import { ServicesModule } from './modules/services/services.module';
import { SettingModule } from './modules/settings/setting.module';
import { UsersModule } from './modules/user/user.module';
import { IsUniqueConstraint } from './modules/validator/is-unique-constarint';
import { WebModule } from './modules/web/web.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { MorganMiddleware } from './morgan.middleware';
import { RazorpayModule } from './razorpay/razorpay.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: NullTransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
