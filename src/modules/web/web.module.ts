import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/entities/banner.entity';
import { Cart } from 'src/entities/cart.entity';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { BannerService } from '../banner/banner.service';
import { CartService } from '../cart/cart.service';
import { MobileApiService } from '../mobileapi/mobileapi.service';
import { PriceService } from '../price/price.service';
import { ServicesService } from '../services/services.service';
import { WebController } from './web.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Price, Service, Banner, Category, Product]),
  ],
  controllers: [WebController],
  providers: [
    MobileApiService,
    ServicesService,
    BannerService,
    CartService,
    PriceService,
  ],
  exports: [],
})
export class WebModule {}
