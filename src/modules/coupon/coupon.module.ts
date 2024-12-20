import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderModule } from '../order/order.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Order, User]),
    forwardRef(() => OrderModule),
  ],
  providers: [CouponService],
  controllers: [CouponController],
  exports: [CouponService],
})
export class CouponModule {}
