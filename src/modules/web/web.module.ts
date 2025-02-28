import { forwardRef, Module } from '@nestjs/common';
import { BannerModule } from '../banner/banner.module';
import { BranchModule } from '../branch/branch.module';
import { CartModule } from '../cart/cart.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { ApiService } from '../mobileapi/api.service';
import { OrderModule } from '../order/order.module';
import { PriceModule } from '../price/price.module';
import { ServicesModule } from '../services/services.module';
import { SettingModule } from '../settings/setting.module';
import { WebController } from './web.controller';

@Module({
  imports: [
    forwardRef(() => InvoiceModule),
    SettingModule,
    OrderModule,
    BranchModule,
    ServicesModule,
    BannerModule,
    PriceModule,
    CartModule,
  ],
  controllers: [WebController],
  providers: [ApiService],
  exports: [],
})
export class WebModule {}
