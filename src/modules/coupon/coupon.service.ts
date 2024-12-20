import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Coupon } from 'src/entities/coupon.entity';
import { Order } from 'src/entities/order.entity';
import { DiscountType } from 'src/enum/coupon_type.enum';
import { Repository } from 'typeorm';
import { CouponFiltrerDto } from '../dto/coupon-filter.dto';
import { OrderService } from '../order/order.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/create.verify-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Response> {
    try {
      const discountCoupon = this.couponRepository.create(createCouponDto);
      const result = await this.couponRepository.save(discountCoupon);

      return {
        statusCode: 201,
        message: 'discount coupon added successfully',
        data: result,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Coupon code already exists');
      }
      throw error;
    }
  }

  async findAll(couponFiltrerDto: CouponFiltrerDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      coupon_type,
      discount_type,
    } = couponFiltrerDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;
    const currentDate = new Date();

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('order.coupon_code', 'order_coupon_code')
            .addSelect('COUNT(order.order_id)', 'usage_count')
            .from(Order, 'order')
            .groupBy('order.coupon_code'),
        'usageCounts',
        'usageCounts.order_coupon_code = coupon.code',
      )
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('order.coupon_code', 'orders_coupon_code')
            .addSelect('order.user_id', 'user_id')
            .addSelect('COUNT(order.order_id)', 'user_usage_count')
            .from(Order, 'order')
            .groupBy('order.coupon_code, order.user_id'),
        'userUsageCounts',
        'userUsageCounts.orders_coupon_code = coupon.code',
      )
      .where('coupon.deleted_at IS NULL')
      .andWhere('userUsageCounts.orders_coupon_code = coupon.code')
      .andWhere('usageCounts.order_coupon_code = coupon.code')
      .andWhere('coupon.start_time <= :currentDate', { currentDate })
      .andWhere('coupon.end_time >= :currentDate', { currentDate })
      .andWhere(
        `(usageCounts.usage_count IS NOT NULL AND usageCounts.usage_count < coupon.total_usage_count) OR usageCounts.usage_count IS NULL`,
      )
      .andWhere(
        `(userUsageCounts.user_usage_count IS NOT NULL AND userUsageCounts.user_usage_count < coupon.maximum_usage_count_per_user) OR userUsageCounts.user_usage_count IS NULL`,
      )
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(coupon.code LIKE :search OR ' +
          'coupon.description LIKE :search OR ' +
          'coupon.title LIKE :search OR ' +
          'coupon.discount_value LIKE :search OR ' +
          'CAST(coupon.total_usage_count AS CHAR) LIKE :search OR ' +
          'CAST(coupon.maximum_usage_count_per_user AS CHAR) LIKE :search OR ' +
          'coupon.start_time LIKE :search OR ' +
          'coupon.end_time LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (coupon_type) {
      queryBuilder.andWhere('coupon.coupon_type IN (:...couponType)', {
        couponType: coupon_type,
      });
    }

    if (discount_type) {
      queryBuilder.andWhere('coupon.discount_type IN (:...discountType)', {
        discountType: discount_type,
      });
    }

    let sortColumn = 'coupon.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = `coupon.${sort_by}`;
    }

    if (order) {
      sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Discount coupons retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
    };
  }

  async getAll(): Promise<Response> {
    const currentDate = new Date();

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('order.coupon_code', 'order_coupon_code')
            .addSelect('COUNT(order.order_id)', 'usage_count')
            .from(Order, 'order')
            .where('order.deleted_at IS NULL')
            .groupBy('order.coupon_code'),
        'usageCounts',
        'usageCounts.order_coupon_code = coupon.code',
      )
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('order.coupon_code', 'orders_coupon_code')
            .addSelect('order.user_id', 'user_id')
            .addSelect('COUNT(order.order_id)', 'user_usage_count')
            .from(Order, 'order')
            .where('order.deleted_at IS NULL')
            .groupBy('order.coupon_code, order.user_id'),
        'userUsageCounts',
        'userUsageCounts.orders_coupon_code = coupon.code',
      )
      .where('coupon.deleted_at IS NULL')
      .andWhere('coupon.start_time <= :currentDate', {
        currentDate,
      })
      .andWhere('coupon.end_time >= :currentDate', {
        currentDate,
      })
      .andWhere('userUsageCounts.orders_coupon_code = coupon.code')
      .andWhere('usageCounts.order_coupon_code = coupon.code')
      .andWhere(
        `(usageCounts.usage_count IS NOT NULL AND usageCounts.usage_count < coupon.total_usage_count) OR usageCounts.usage_count IS NULL`,
      )
      .andWhere(
        `(userUsageCounts.user_usage_count IS NOT NULL AND userUsageCounts.user_usage_count < coupon.maximum_usage_count_per_user) OR userUsageCounts.user_usage_count IS NULL`,
      );

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Discount coupons retrieved successfully',
      data: result,
    };
  }

  async findOne(coupon_id: number): Promise<Response> {
    const coupon = await this.couponRepository.findOne({
      where: { coupon_id: coupon_id, deleted_at: null },
    });

    if (!coupon) {
      throw new NotFoundException('coupon not found');
    }
    return {
      statusCode: 200,
      message: 'Coupon retrived successfully',
      data: coupon,
    };
  }

  async update(
    id: number,
    updateCouponDto: UpdateCouponDto,
  ): Promise<Response> {
    const coupon = await this.couponRepository.findOne({
      where: { coupon_id: id },
    });

    if (!coupon) {
      return {
        statusCode: 404,
        message: 'coupon not found',
        data: null,
      };
    }

    await this.couponRepository.update(id, updateCouponDto);

    return {
      statusCode: 200,
      message: 'coupon updated successfully',
      data: { coupon },
    };
  }

  async remove(id: number): Promise<Response> {
    const coupon = await this.couponRepository.findOne({
      where: { coupon_id: id, deleted_at: null },
    });
    if (!coupon) {
      return {
        statusCode: 404,
        message: 'coupon not found',
        data: null,
      };
    }
    coupon.deleted_at = new Date();
    await this.couponRepository.save(coupon);

    return {
      statusCode: 200,
      message: 'coupon deleted successfully',
      data: coupon,
    };
  }

  async applyCoupon(
    applyCouponDto: ApplyCouponDto,
    user_id: number,
  ): Promise<Response> {
    const { coupon_code, order_Total } = applyCouponDto;

    const coupon = await this.couponRepository.findOne({
      where: { code: coupon_code, deleted_at: null },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    const totalCouponUsedCount = await this.orderService.countOrdersByCondition(
      { coupon_code },
    );

    if (totalCouponUsedCount >= coupon.total_usage_count) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const userCouponUsedCount = await this.orderService.countOrdersByCondition({
      user_id,
      coupon_code,
    });

    if (userCouponUsedCount >= coupon.maximum_usage_count_per_user) {
      throw new BadRequestException(
        'You have exceeded the usage limit for this coupon',
      );
    }

    let discountAmount = 0;
    if (coupon.discount_type === DiscountType.PERCENTAGE) {
      discountAmount = (order_Total * coupon.discount_value) / 100;
    } else if (coupon.discount_type === DiscountType.AMOUNT) {
      discountAmount = coupon.discount_value;
    }

    const finalTotal = order_Total - discountAmount;

    return {
      statusCode: 200,
      message: 'Coupon applied successfully',
      data: {
        discountAmount,
        finalTotal,
      },
    };
  }
}
