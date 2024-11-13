import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail, User])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
