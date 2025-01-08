import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Response } from 'src/dto/response.dto';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { PaginationQueryDto } from 'src/modules/dto/pagination-query.dto';
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
    razorpay.status = data.status;
    razorpay.user_id = user_id;
    await this.rezorpayRepository.save(razorpay);

    return { razorpay_order_id: razorpay.razorpay_order_id };
  }

  async getAllTransactions(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.rezorpayRepository
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
      queryBuilder.andWhere('razorpay.razorpay_order_id LIKE :search', {
        search: `%${search}%`,
      });
    }

    let sortColumn = 'razorpay.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'transaction retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
    };
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
