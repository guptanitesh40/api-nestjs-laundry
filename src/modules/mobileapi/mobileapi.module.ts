import { forwardRef, Module } from '@nestjs/common';
import { BannerModule } from '../banner/banner.module';
import { CartModule } from '../cart/cart.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { OrderModule } from '../order/order.module';
import { PriceModule } from '../price/price.module';
import { ServicesModule } from '../services/services.module';
import { ApiService } from './api.service';
import { MobileApiController } from './mobileapi.controller';

@Module({
  imports: [
    forwardRef(() => InvoiceModule),
    OrderModule,
    BannerModule,
    ServicesModule,
    PriceModule,
    CartModule,
  ],
  controllers: [MobileApiController],
  providers: [ApiService],
  exports: [ApiService],
})
export class MobileApiModule {}
