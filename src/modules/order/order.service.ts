import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addHours } from 'date-fns';
import { Response } from 'src/dto/response.dto';
import { UserAddress } from 'src/entities/address.entity';
import { Category } from 'src/entities/category.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { Role } from 'src/enum/role.enum';
import { appendBaseUrlToImages } from 'src/utils/image-path.helper';
import { DataSource, Repository } from 'typeorm';
import { CouponService } from '../coupon/coupon.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { NotificationService } from '../notification/notification.service';
import { SettingService } from '../settings/setting.service';
import { UserService } from '../user/user.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderRepository: Repository<OrderDetail>,
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly couponService: CouponService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly settingService: SettingService,
    private dataSource: DataSource,
  ) {}

  private mapOrderToResponse(order: OrderDetail) {
    return {
      order_id: order.order_id,
      description: order.description,
      coupon_code: order.coupon_code,
      express_delivery_charges: order.express_delivery_charges,
      sub_total: order.sub_total,
      shipping_charge: order.shipping_charges,
      total: order.total,
      address_details: order.address_details,
      order_status: order.order_status,
      payment_status: order.payment_status,
      payment_type: order.payment_type,
      transaction_id: order.transaction_id,

      item_field: `product_id,  service_id,  category_id :price`,
      items: order.items.map((item) => ({
        item_details: `${item.product_id}_${item.service_id}_${item.category_id} : ${item.price}`,
      })),
    };
  }

  async create(createOrderDto: CreateOrderDto): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(UserAddress, {
        where: { address_id: createOrderDto.address_id },
      });
      if (!address) {
        throw new NotFoundException(
          `Address with id ${createOrderDto.address_id} not found`,
        );
      }

      const user = await this.userService.findUserById(createOrderDto.user_id);

      const address_details = `${address.building_number}, ${address.area}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;
      const settingKeys = [
        'estimate_pickup_normal_hour',
        'estimate_pickup_express_hour',
        'estimate_delivery_normal_day',
        'estimate_delivery_express_day',
        'gst_percentage',
      ];
      const settingsResponse = await this.settingService.findAll(settingKeys);
      const settings = settingsResponse.data;

      let sub_total = createOrderDto.sub_total;
      let coupon_discount = 0;
      const coupon_code = createOrderDto.coupon_code;

      if (coupon_code) {
        const couponValidation = await this.couponService.applyCoupon(
          { coupon_Code: coupon_code, order_Total: sub_total },
          createOrderDto.user_id,
        );
        coupon_discount = couponValidation.data.discountAmount;
        sub_total -= coupon_discount;
      }

      const gst_percentage = parseFloat(settings['gst_percentage'] || 0);
      const gst_amount = (sub_total * gst_percentage) / 100;
      const total =
        sub_total +
        gst_amount +
        createOrderDto.shipping_charges +
        (createOrderDto.express_delivery_charges || 0);

      const paid_amount = createOrderDto.paid_amount || 0;

      let kasar_amount = 0;
      if (createOrderDto.payment_type === PaymentType.CASH_ON_DELIVERY) {
        kasar_amount = paid_amount < total ? total - paid_amount : 0;
      }

      const estimated_pickup_time = createOrderDto.express_delivery_charges
        ? addHours(
            new Date(),
            parseInt(settings['estimate_pickup_express_hour']),
          )
        : addHours(
            new Date(),
            parseInt(settings['estimate_pickup_normal_hour']),
          );

      const deliveryDaysToAdd = createOrderDto.express_delivery_charges
        ? settings['estimate_delivery_express_day']
        : settings['estimate_delivery_normal_day'];

      const estimated_delivery_date = addDays(new Date(), deliveryDaysToAdd);

      const orderItemsMap = new Map();

      for (const item of createOrderDto.items) {
        const key = `${item.category_id}-${item.product_id}-${item.service_id}`;
        if (orderItemsMap.has(key)) {
          const existingItem = orderItemsMap.get(key);
          existingItem.quantity += item.quantity || 1;
        } else {
          orderItemsMap.set(key, {
            category_id: item.category_id,
            product_id: item.product_id,
            service_id: item.service_id,
            price: item.price,
            quantity: item.quantity || 1,
          });
        }
      }

      const order = this.orderRepository.create({
        ...createOrderDto,
        sub_total,
        gst: gst_amount,
        total,
        coupon_code,
        coupon_discount,
        address_details,
        kasar_amount,
        estimated_pickup_time,
        estimated_delivery_time: estimated_delivery_date,
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems = Array.from(orderItemsMap.values()).map((item) => ({
        order: savedOrder,
        ...item,
      }));

      for (const orderItem of orderItems) {
        const existingItem = await queryRunner.manager.findOne(OrderItem, {
          where: {
            category_id: orderItem.category_id,
            product_id: orderItem.product_id,
            service_id: orderItem.service_id,
            order_id: savedOrder.order_id,
          },
        });

        if (existingItem) {
          await queryRunner.manager.save(OrderItem, existingItem);
        } else {
          await queryRunner.manager.insert(OrderItem, {
            ...orderItem,
            order_id: savedOrder.order_id,
          });
        }
      }

      await queryRunner.commitTransaction();
      const orderDetail = {
        order_id: savedOrder.order_id,
        total: savedOrder.total,
        created_at: savedOrder.created_at,
        items: orderItems.length,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
        },
      };

      await this.notificationService.sendOrderNotification(orderDetail);

      return {
        statusCode: 201,
        message: 'Order details added successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async createAdminOrder(
    createOrderDto: CreateOrderDto,
    admin_id: number,
  ): Promise<Response> {
    await this.userService.findOneByRole(createOrderDto.user_id, Role.CUSTOMER);
    createOrderDto.created_by_user_id = admin_id;

    const result = await this.create(createOrderDto);
    return {
      statusCode: 201,
      message: 'Order created successfully',
      data: {
        result,
      },
    };
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } = paginationQuery;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'items')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('items.category', 'category')
      .innerJoinAndSelect('items.product', 'product')
      .innerJoinAndSelect('items.service', 'service')
      .where('order.deleted_at IS NULL')
      .select([
        'order',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
        'items.item_id',
        'category.category_id',
        'category.name',
        'product.product_id',
        'product.name',
        'product.image',
        'service.service_id',
        'service.name',
        'service.image',
      ])
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(order.description LIKE :search OR ' +
          'order.coupon_code LIKE :search OR ' +
          'order.address_details LIKE :search OR ' +
          'user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let sortColumn = 'order.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn =
        sort_by === 'first_name' ||
        sort_by === 'last_name' ||
        sort_by === 'email' ||
        sort_by === 'mobile_number'
          ? `user.${sort_by}`
          : `order.${sort_by}`;
    }

    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [orders, total] = await queryBuilder.getManyAndCount();
    return {
      statusCode: 200,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async findOne(order_id: number): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const result = this.mapOrderToResponse(order);

    return {
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: result,
    };
  }

  async updateOrder(
    order_id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const { address_id, items, ...orderUpdates } = updateOrderDto;

    if (address_id) {
      const address = await this.addressRepository.findOne({
        where: { address_id },
      });
      if (!address) {
        throw new NotFoundException(`Address with id ${address_id} not found`);
      }

      order.address_details = `${address.building_number}, ${address.area}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;
    }

    const settingKeys = ['gst_percentage'];
    const settingsResponse = await this.settingService.findAll(settingKeys);
    const settings = settingsResponse.data;

    const gst_percentage = parseFloat(settings['gst_percentage'] || 0);
    const sub_total = updateOrderDto.sub_total;
    const gst_amount = (sub_total * gst_percentage) / 100;
    const total =
      sub_total +
      gst_amount +
      (updateOrderDto.shipping_charges || 0) +
      (updateOrderDto.express_delivery_charges || 0);

    Object.assign(order, {
      ...orderUpdates,
      sub_total,
      gst: gst_amount,
      total,
    });

    const updatedOrder = await this.orderRepository.save(order);

    if (items) {
      await this.orderItemRepository.delete({ order: { order_id } });

      const orderItems = items.map((item) => ({
        ...item,
        order: updatedOrder,
      }));

      await this.orderItemRepository.insert(orderItems);
    }

    return {
      statusCode: 200,
      message: 'Order updated successfully',
      data: this.mapOrderToResponse(updatedOrder),
    };
  }

  async updateOrderStatus(order_id: number, status: number): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    order.order_status = status;
    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Order status updated successfully',
    };
  }

  async updatePaymentStatus(
    order_id: number,
    status: number,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    order.payment_status = status;
    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Payment status updated successfully',
    };
  }

  async assignDeliveryBoy(
    order_id: number,
    delivery_boy_id: number,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const deliveryBoy = await this.userService.findOneByRole(
      delivery_boy_id,
      Role.DELIVERY_BOY,
    );

    if (!deliveryBoy) {
      throw new NotFoundException(
        `Delivery Boy with id ${delivery_boy_id} not found`,
      );
    }

    order.delivery_boy_id = deliveryBoy.user_id;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Delivery boy assigned successfully',
    };
  }

  async getOrderDetail(order_id: number): Promise<Response> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.items', 'items')
      .innerJoinAndSelect('items.category', 'category')
      .innerJoinAndSelect('items.product', 'product')
      .innerJoinAndSelect('items.service', 'service')
      .where('order.order_id = :orderId', { orderId: order_id })
      .andWhere('order.deleted_at IS NULL')
      .select([
        'order',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
        'items',
        'category.category_id',
        'category.name',
        'product.product_id',
        'product.name',
        'product.image',
        'service.service_id',
        'service.name',
        'service.image',
      ])
      .groupBy(
        'order.order_id, items.item_id, category.category_id, product.product_id, service.service_id',
      )
      .getOne();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.items = order.items.map((item) => {
      item.product = appendBaseUrlToImages([item.product])[0];

      item.service = appendBaseUrlToImages([item.service])[0];

      return item;
    });
    return {
      statusCode: 200,
      message: 'Order retrived successfully',
      data: order,
    };
  }

  async getAll(user_id: number): Promise<Response> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.user_id = :userId', { userId: user_id })
      .select([
        'order.order_id As order_id',
        'order.total As total',
        'order.created_at As created_at',
        'COUNT(items.item_id) As total_item',
      ])
      .groupBy('order.order_id')
      .getRawMany();

    return {
      statusCode: 200,
      message: 'order retrived',
      data: orders,
    };
  }

  async getAssignedOrders(
    delivery_boy_id: number,
    search?: string,
  ): Promise<Response> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.delivery_boy_id = :delivery_boy_id', { delivery_boy_id })
      .select([
        'order.order_id As order_id',
        'order.delivery_boy_id As delivery_boy_id',
        'user.user_id As user_id',
        'user.first_name As first_name',
        'user.last_name As last_name',
        'user.mobile_number As mobile_number',
        'order.address_details As address',
        'COUNT(items.item_id) As total_item',
        'order.estimated_pickup_time As estimated_pickup_time_hour',
      ])
      .groupBy('order.order_id,user.user_id');

    if (search) {
      queryBuilder.andWhere(
        '(user.first_name LIKE :search OR user.last_name LIKE :search OR user.mobile_number LIKE :search OR order.address_details LIKE :search OR user.email LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const ordersWithAssignedDeliveryBoys = await queryBuilder.getRawMany();

    return {
      statusCode: 200,
      message: 'Orders with assigned delivery boys retrieved successfully',
      data: ordersWithAssignedDeliveryBoys,
    };
  }

  async pickupOrder(
    order_id: number,
    delivery_boy_id: number,
    comment: string,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id, delivery_boy_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    order.pickup_comment = comment;
    order.order_status = OrderStatus.READY_TO_DELIVERY;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Order picked up successfully',
    };
  }

  async delete(order_id: number): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id, deleted_at: null },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    order.deleted_at = new Date();
    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Order deleted successfully',
    };
  }

  async createRefund(refundOrderDto: RefundOrderDto): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: refundOrderDto.order_id },
    });

    if (order.refund_amount > 0) {
      throw new BadRequestException(
        'Refund has already been processed for this order.',
      );
    }

    let newRefundAmount = 0;

    if (refundOrderDto.refund_status === RefundStatus.FULL) {
      newRefundAmount = order.total;
    } else if (refundOrderDto.refund_status === RefundStatus.PARTIAL) {
      newRefundAmount = refundOrderDto.refund_amount;
    }

    order.refund_amount = parseFloat(newRefundAmount.toFixed(2));
    order.refund_status = refundOrderDto.refund_status;
    order.refund_descriptions = refundOrderDto.refund_description;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Refund processed successfully',
    };
  }
}
