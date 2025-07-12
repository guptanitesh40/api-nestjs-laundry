import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaundryHistory } from 'src/entities/laundry-history.entity';
import { LaundryHistoryController } from './laundry-history.controller';
import { LaundryHistoryService } from './laundry-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([LaundryHistory])],
  controllers: [LaundryHistoryController],
  providers: [LaundryHistoryService],
})
export class LaundryHistoryModule {}
