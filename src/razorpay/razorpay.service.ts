import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  async createOrder(amount: number, currency: string) {
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    return await this.razorpay.orders.create(options);
  }

  async verifySignature(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ): Promise<boolean> {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    return generated_signature === razorpay_signature;
  }
}
