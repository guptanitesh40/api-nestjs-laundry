import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(RazorpayTransactions)
    private rezorpayRepository: Repository<RazorpayTransactions>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  async createOrder(amount: number, currency: string, user_id: number) {
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const data = await this.razorpay.orders.create(options);
    const razorpay: any = this.rezorpayRepository.create();
    razorpay.amount = amount;
    razorpay.currency = data.currency;
    razorpay.razorpay_order_id = data.id;
    razorpay.user_id = user_id;
    await this.rezorpayRepository.save(razorpay);

    return { razorpay_order_id: razorpay.razorpay_order_id };
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
