import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { PriceModule } from '../price/price.module';
import { ProductModule } from '../products/product.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../user/user.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => OrderModule),
    UsersModule,
    NotificationModule,
    ProductModule,
    ServicesModule,
    PriceModule,
  ],
  providers: [InvoiceService],
  controllers: [InvoiceController],
  exports: [InvoiceService],
})
export class InvoiceModule {}
