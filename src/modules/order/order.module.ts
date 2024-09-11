import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from 'src/entities/address.entity';
import { Category } from 'src/entities/category.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { User } from 'src/entities/user.entity';
import { CouponModule } from '../coupon/coupon.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderDetail,
      OrderItem,
      UserAddress,
      Category,
      Product,
      Service,
      Coupon,
      User,
    ]),
    CouponModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
