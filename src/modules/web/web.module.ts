import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/entities/banner.entity';
import { Cart } from 'src/entities/cart.entity';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { BannerService } from '../banner/banner.service';
import { BranchModule } from '../branch/branch.module';
import { CartService } from '../cart/cart.service';
import { InvoiceModule } from '../invoice/invoice.module';
import { ApiService } from '../mobileapi/api.service';
import { OrderModule } from '../order/order.module';
import { PriceService } from '../price/price.service';
import { ServicesService } from '../services/services.service';
import { SettingModule } from '../settings/setting.module';
import { WebController } from './web.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Price, Service, Banner, Category, Product]),
    forwardRef(() => InvoiceModule),
    SettingModule,
    OrderModule,
    BranchModule,
  ],
  controllers: [WebController],
  providers: [
    ApiService,
    ServicesService,
    BannerService,
    CartService,
    PriceService,
  ],
  exports: [],
})
export class WebModule {}
