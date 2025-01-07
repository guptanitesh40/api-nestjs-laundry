import { Module } from '@nestjs/common';
import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';

@Module({
  providers: [RazorpayService],
  controllers: [RazorpayController],
  exports: [RazorpayService],
})
export class RazorpayModule {}
