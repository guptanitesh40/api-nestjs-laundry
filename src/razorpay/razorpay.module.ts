import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [TypeOrmModule.forFeature([RazorpayTransactions])],
  providers: [RazorpayService],
  controllers: [RazorpayController, RazorpayWebhookController],
  exports: [RazorpayService],
})
export class RazorpayModule {}
