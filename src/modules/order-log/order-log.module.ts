import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderLog } from 'src/entities/order-logs.entity';
import { OrderLogService } from './order-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderLog])],
  providers: [OrderLogService],
  exports: [OrderLogService],
})
export class OrderLogModule {}
