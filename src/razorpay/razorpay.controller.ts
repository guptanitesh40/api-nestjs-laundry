import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { RazorpayService } from './razorpay.service';

@Controller()
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('razorpay/verify')
  async verifyPayment(@Body() body: any): Promise<Response> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const isValid = await this.razorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (isValid) {
      return {
        statusCode: 200,
        message: 'Payment verified successfully',
      };
    } else {
      throw new BadRequestException(
        `Invalid payment signature. Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`,
      );
    }
  }
}
