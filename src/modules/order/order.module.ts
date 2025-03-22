import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { RazorpayModule } from 'src/razorpay/razorpay.module';
import { BranchModule } from '../branch/branch.module';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { NotesModule } from '../notes/note.module';
import { NotificationModule } from '../notification/notification.module';
import { PriceModule } from '../price/price.module';
import { SettingModule } from '../settings/setting.module';
import { UsersModule } from '../user/user.module';
import { WorkshopModule } from '../workshop/workshop.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => UsersModule),
    forwardRef(() => CouponModule),
    forwardRef(() => InvoiceModule),
    SettingModule,
    PriceModule,
    WorkshopModule,
    CartModule,
    NotesModule,
    RazorpayModule,
    forwardRef(() => NotificationModule),
    BranchModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
