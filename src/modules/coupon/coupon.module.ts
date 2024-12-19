import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderModule } from '../order/order.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, OrderDetail, User]),
    forwardRef(() => OrderModule),
  ],
  providers: [CouponService],
  controllers: [CouponController],
  exports: [CouponService],
})
export class CouponModule {}
