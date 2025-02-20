import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from 'src/entities/feedback.entity';
import { Order } from 'src/entities/order.entity';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { User } from 'src/entities/user.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Feedback, RazorpayTransactions]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
