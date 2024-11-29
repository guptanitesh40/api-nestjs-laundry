import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Coupon } from 'src/entities/coupon.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { DiscountType } from 'src/enum/coupon_type.enum';
import { Repository } from 'typeorm';
import { CouponFiltrerDto } from '../dto/coupon-filter.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/create.verify-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,

    @InjectRepository(OrderDetail)
    private readonly orderRepository: Repository<OrderDetail>,
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

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.deleted_at IS NULL')
      .andWhere(
        'coupon.start_time <= :currentDate AND coupon.end_time >= :currentDate',
        { currentDate: new Date() },
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
      queryBuilder.andWhere('coupon.coupon_type = :coupon_type', {
        coupon_type,
      });
    }

    if (discount_type) {
      queryBuilder.andWhere('coupon.discount_type = :discount_type', {
        discount_type,
      });
    }

    let sortColumn = 'coupon.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
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
    const { coupon_Code, order_Total } = applyCouponDto;

    const coupon = await this.couponRepository.findOne({
      where: { code: coupon_Code, deleted_at: null },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    const currentDate = new Date();

    if (currentDate < coupon.start_time || currentDate > coupon.end_time) {
      await this.couponRepository.update(coupon.coupon_id, {
        deleted_at: new Date(),
      });
      throw new BadRequestException('Coupon is not valid at this time');
    }

    const totalCouponUsedCount = await this.orderRepository.count({
      where: { coupon_code: coupon_Code },
    });

    if (totalCouponUsedCount >= coupon.total_usage_count) {
      await this.couponRepository.update(coupon.coupon_id, {
        deleted_at: new Date(),
      });
      throw new BadRequestException('Coupon usage limit reached');
    }

    const userCouponUsedCount = await this.orderRepository.count({
      where: { coupon_code: coupon_Code, user_id: user_id },
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
