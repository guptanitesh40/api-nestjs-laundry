import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { Order } from 'src/entities/order.entity';
import { RedisQueueService } from 'src/redis.config';
import { OrderModule } from '../order/order.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Order, Notification]),
    forwardRef(() => OrderModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, RedisQueueService],
  exports: [NotificationService],
})
export class NotificationModule {}
