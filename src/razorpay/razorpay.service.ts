import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Response } from 'src/dto/response.dto';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { RazorpayFilterDto } from 'src/modules/dto/razorpay-filter.dto';
import { Repository } from 'typeorm';
import { GeneratePaymentLinkDto } from './dto/generate-payment-link.dto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(RazorpayTransactions)
    private razorpayRepository: Repository<RazorpayTransactions>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  async createOrder(
    amount: number,
    currency: string,
    user_id: number,
  ): Promise<Response> {
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const data = await this.razorpay.orders.create(options);

    const razorpay: any = this.razorpayRepository.create({
      amount: amount,
      currency: data.currency,
      razorpay_order_id: data.id,
      status: data.status,
      user_id: user_id,
    });

    await this.razorpayRepository.save(razorpay);
    return {
      statusCode: 200,
      message: 'Transaction details',
      data: {
        razorpay_order_id: razorpay.razorpay_order_id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
        razorpay_secret: process.env.RAZORPAY_SECRET,
      },
    };
  }

  async findTransactionByOrderId(orderId: string): Promise<any> {
    const result = await this.razorpayRepository.findOne({
      where: { razorpay_order_id: orderId, deleted_at: null },
    });
    return result;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
  ): Promise<any> {
    try {
      const razorpay = await this.razorpayRepository.findOne({
        where: { razorpay_order_id: transactionId, deleted_at: null },
      });

      razorpay.status = status;

      await this.razorpayRepository.save(razorpay);

      return { success: true, data: razorpay };
    } catch (error) {
      console.error('Failed to update Razorpay transaction status:', error);
      return { success: false };
    }
  }

  async getAllTransactions(
    razorpayFilterDto: RazorpayFilterDto,
  ): Promise<Response> {
    const { per_page, page_number, search, sort_by, order, status, user_id } =
      razorpayFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.razorpayRepository
      .createQueryBuilder('razorpay')
      .innerJoinAndSelect('razorpay.user', 'user')
      .where('razorpay.deleted_at IS NULL')
      .select([
        'razorpay',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
      ])
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(razorpay.razorpay_order_id LIKE :search OR ' +
          'razorpay.amount LIKE :search OR ' +
          'razorpay.currency LIKE :search OR ' +
          ' razorpay.status LIKE :search OR ' +
          'user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('razorpay.status In(:...razorPayStatuses)', {
        razorPayStatuses: status,
      });
    }

    if (user_id) {
      queryBuilder.andWhere('user.user_id In(:...userId)', {
        userId: user_id,
      });
    }

    let sortColumn = 'razorpay.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn =
        sort_by === 'first_name' ||
        sort_by === 'last_name' ||
        sort_by === 'email' ||
        sort_by === 'mobile_number'
          ? `user.${sort_by}`
          : `razorpay.${sort_by}`;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Transaction retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
    };
  }

  async generatePaymentLink(
    paymentDetails: GeneratePaymentLinkDto,
  ): Promise<Response> {
    const orderResponse = {
      amount: paymentDetails.amount * 100,
      currency: paymentDetails.currency,
      receipt: `receipt_${Date.now()}`,
    };

    const data = await this.razorpay.orders.create(orderResponse);

    const paymentLinkResponse = {
      amount: paymentDetails.amount * 100,
      currency: paymentDetails.currency,
      customer: {
        name: paymentDetails.customer.name,
        contact: paymentDetails.customer.contact,
        email: paymentDetails.customer.email,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
    };

    const response =
      await this.razorpay.paymentLink.create(paymentLinkResponse);

    const razorpay: any = this.razorpayRepository.create({
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      razorpay_order_id: data.id,
      razorpay_payment_link_id: response.id,
      status: response.status,
      user_id: paymentDetails.user_id,
    });

    await this.razorpayRepository.save(razorpay);

    return {
      message: 'Payment link sent successfully',
      statusCode: 201,
      data: { payment_link: response.short_url, razorpay },
    };
  }

  async updateStatusPaymentLinkId(payment_link_id: string, status: string) {
    const razorpay = await this.razorpayRepository.findOne({
      where: { razorpay_payment_link_id: payment_link_id, deleted_at: null },
    });

    razorpay.status = status;

    await this.razorpayRepository.save(razorpay);

    return razorpay;
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
