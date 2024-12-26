import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from 'src/entities/address.entity';
import { Category } from 'src/entities/category.entity';
import { Coupon } from 'src/entities/coupon.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { User } from 'src/entities/user.entity';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';
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
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      UserAddress,
      Category,
      Product,
      Service,
      Coupon,
      User,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => CouponModule),
    SettingModule,
    PriceModule,
    WorkshopModule,
    CartModule,
    NotesModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
