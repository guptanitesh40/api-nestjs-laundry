import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from 'src/entities/feedback.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail, User, Feedback])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
