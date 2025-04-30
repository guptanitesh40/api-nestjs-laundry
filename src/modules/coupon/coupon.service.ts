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
import { CouponType, DiscountType } from 'src/enum/coupon_type.enum';
import { customerApp } from 'src/firebase.config';
import { Repository } from 'typeorm';
import { CouponFiltrerDto } from '../dto/coupon-filter.dto';
import { NotificationService } from '../notification/notification.service';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
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
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Response> {
    try {
      const discountCoupon = this.couponRepository.create(createCouponDto);
      const result = await this.couponRepository.save(discountCoupon);

      if (
        createCouponDto.coupon_type === CouponType.APP ||
        createCouponDto.coupon_type === CouponType.BOTH
      ) {
        const users = await this.userService.getAllCustomerDeviceTokens();

        const msg =
          createCouponDto.discount_type === DiscountType.AMOUNT
            ? `${createCouponDto.discount_value}rs`
            : `${createCouponDto.discount_value}%`;

        if (users) {
          const title = 'New Discount Coupon!';
          const body = `Use Coupon code: ${result.code} to get ${msg} off. Hurry up!`;
          await this.notificationService.sendPushNotificationsAllCustomer(
            customerApp,
            users,
            title,
            body,
          );
        }
      }

      return {
        statusCode: 201,
        message: 'Discount coupon added successfully',
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
      coupon_types,
      discount_types,
    } = couponFiltrerDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.deleted_at IS NULL')
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

    if (coupon_types) {
      queryBuilder.andWhere('coupon.coupon_type IN (:...couponTypes)', {
        couponTypes: coupon_types,
      });
    }

    if (discount_types) {
      queryBuilder.andWhere('coupon.discount_type IN (:...discountTypes)', {
        discountTypes: discount_types,
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
      data: {
        result,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async getAll(user_id: number, coupon_type?: CouponType): Promise<Response> {
    const currentDate = new Date();

    const queryBuilder = this.couponRepository
      .createQueryBuilder('coupon')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(DISTINCT orders.order_id)', 'usage_count')
            .from(Order, 'orders')
            .where(
              'orders.deleted_at IS NULL AND orders.coupon_code = coupon.code',
            ),
        'usage_count',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(DISTINCT orders.order_id)', 'user_usage_count')
            .from(Order, 'orders')
            .where(
              'orders.deleted_at IS NULL AND orders.coupon_code = coupon.code AND orders.user_id = :user_id',
              { user_id },
            ),
        'user_usage_count',
      )
      .where('coupon.deleted_at IS NULL')
      .andWhere('coupon.start_time <= :currentDate', { currentDate })
      .andWhere('coupon.end_time >= :currentDate', { currentDate })
      .having(
        'usage_count < coupon.total_usage_count AND user_usage_count < coupon.maximum_usage_count_per_user',
      )
      .orderBy('coupon_id', 'DESC');

    if (Number(coupon_type) === CouponType.APP) {
      queryBuilder.andWhere('coupon.coupon_type IN (:...couponType)', {
        couponType: [CouponType.APP, CouponType.BOTH],
      });
    }
    if (Number(coupon_type) === CouponType.WEBSITE) {
      queryBuilder.andWhere('coupon.coupon_type IN (:...couponType)', {
        couponType: [CouponType.WEBSITE, CouponType.BOTH],
      });
    }

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
    coupon_id: number,
    updateCouponDto: UpdateCouponDto,
  ): Promise<Response> {
    const coupon = await this.couponRepository.findOne({
      where: { coupon_id },
    });

    if (!coupon) {
      return {
        statusCode: 404,
        message: 'Coupon not found',
        data: null,
      };
    }

    await this.couponRepository.update(coupon_id, updateCouponDto);

    Object.assign(coupon, updateCouponDto);

    return {
      statusCode: 200,
      message: 'Coupon updated successfully',
      data: { coupon },
    };
  }

  async remove(coupon_id: number): Promise<Response> {
    const coupon = await this.couponRepository.findOne({
      where: { coupon_id, deleted_at: null },
    });
    if (!coupon) {
      return {
        statusCode: 404,
        message: 'Coupon not found',
        data: null,
      };
    }
    coupon.deleted_at = new Date();
    await this.couponRepository.save(coupon);

    return {
      statusCode: 200,
      message: 'Coupon deleted successfully',
      data: coupon,
    };
  }

  async applyCoupon(
    applyCouponDto: ApplyCouponDto,
    user_id: number,
  ): Promise<Response> {
    const currentDate = new Date();
    const { coupon_code, order_Total } = applyCouponDto;

    const coupon = await this.couponRepository.findOne({
      where: { code: coupon_code, deleted_at: null },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (!(coupon.start_time <= currentDate && coupon.end_time >= currentDate)) {
      throw new BadRequestException('Coupon time is a reached');
    }

    const totalCouponUsedCount = await this.orderService.countOrdersByCondition(
      { coupon_code },
    );

    if (totalCouponUsedCount >= coupon.total_usage_count) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (order_Total < coupon.min_cart_value) {
      throw new BadRequestException(
        'This coupon is not valid for the current cart value.',
      );
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
