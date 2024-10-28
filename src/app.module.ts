import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './database/data-source';
import { AddressModule } from './modules/address/address.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannerModule } from './modules/banner/banner.module';
import { BranchModule } from './modules/branch/branch.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/categories/category.module';
import { CompanyModule } from './modules/company/company.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { MobileApiModule } from './modules/mobileapi/mobileapi.module';
import { NotesModule } from './modules/notes/note.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PriceModule } from './modules/price/price.module';
import { ProductModule } from './modules/products/product.module';
import { ServicesModule } from './modules/services/services.module';
import { SettingModule } from './modules/settings/setting.module';
import { UsersModule } from './modules/user/user.module';
import { IsUniqueConstraint } from './modules/validator/is-unique-constarint';
import { WebModule } from './modules/web/web.module';
import { MorganMiddleware } from './morgan.middleware';
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
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
