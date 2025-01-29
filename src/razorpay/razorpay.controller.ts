import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { RazorpayFilterDto } from 'src/modules/dto/razorpay-filter.dto';
import { GeneratePaymentLinkDto } from './dto/generate-payment-link.dto';
import { RazorpayService } from './razorpay.service';

@Controller('razorpay')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('create-order')
  @Roles(Role.CUSTOMER)
  async createOrder(@Body() body: any, @Request() req) {
    const user = req.user;
    return this.razorpayService.createOrder(
      body.amount,
      body.currency,
      user.user_id,
    );
  }

  @Get('transaction')
  @Roles(Role.SUPER_ADMIN)
  async getAllTransactions(
    @Query() razorpayFilterDto: RazorpayFilterDto,
  ): Promise<Response> {
    return await this.razorpayService.getAllTransactions(razorpayFilterDto);
  }

  @Post('generate-payment-link')
  @Roles(Role.SUPER_ADMIN)
  async generatePaymentLink(
    @Body() paymentDetails: GeneratePaymentLinkDto,
  ): Promise<any> {
    return this.razorpayService.generatePaymentLink(paymentDetails);
  }

  @Post('verify')
  @Roles(Role.CUSTOMER)
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
