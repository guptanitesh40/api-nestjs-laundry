import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { UsersModule } from '../user/user.module';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon]),
    forwardRef(() => OrderModule),
    UsersModule,
    NotificationModule,
  ],
  providers: [CouponService],
  controllers: [CouponController],
  exports: [CouponService],
})
export class CouponModule {}
