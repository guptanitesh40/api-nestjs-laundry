import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from 'src/entities/order.entity';
import { OrderModule } from '../order/order.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([OrderDetail]),
    forwardRef(() => OrderModule),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
