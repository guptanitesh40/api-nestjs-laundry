import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';
import { RazorpayService } from './razorpay.service';

@Controller('webhooks')
export class RazorpayWebhookController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') razorpaySignature: string,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      console.warn('Webhook signature mismatch');
      return { success: false };
    }

    const event = req.body;

    if (event.event === 'payment_link.paid') {
      const paymentLinkId = event.payload.payment_link.entity.id;

      await this.razorpayService.updateStatusPaymentLinkId(
        paymentLinkId,
        'paid',
      );
    }

    return { success: true };
  }
}
