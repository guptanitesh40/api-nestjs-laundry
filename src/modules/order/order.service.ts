import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { UserAddress } from 'src/entities/address.entity';
import { Category } from 'src/entities/category.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { Repository } from 'typeorm';
import { CouponService } from '../coupon/coupon.service';
import { CreateOrderDto } from './dto/create-order.dto';

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

      item_field: `product_id,  service_id,  category_id :price`,
      items: order.items.map((item) => ({
        item_details: `${item.product_id}_${item.service_id}_${item.category_id} : ${item.price}`,
      })),
    };
  }

  async create(createOrderDto: CreateOrderDto): Promise<Response> {
    const address = await this.addressRepository.findOne({
      where: { address_id: createOrderDto.address_id },
    });
    if (!address) {
      throw new NotFoundException(
        `Address with id ${createOrderDto.address_id} not found`,
      );
    }

    const address_details = `${address.building_number}, ${address.area}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;

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

    const total =
      sub_total +
      createOrderDto.shipping_charges +
      (createOrderDto.express_delivery_charges || 0);

    const order = this.orderRepository.create({
      ...createOrderDto,
      sub_total,
      total,
      coupon_code,
      coupon_discount,
      address_details,
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = createOrderDto.items.map((item) => ({
      order: savedOrder,
      category_id: item.category_id,
      product_id: item.product_id,
      service_id: item.service_id,
      price: item.price,
    }));

    await this.orderItemRepository.insert(orderItems);

    return {
      statusCode: 201,
      message: 'Order details added successfully',
    };
  }
  async findAll(): Promise<Response> {
    const orders = await this.orderRepository.find({
      where: { deleted_at: null },
    });

    const result = orders.map(this.mapOrderToResponse.bind(this));

    return {
      statusCode: 200,
      message: 'Orders retrieved successfully',
      data: result,
    };
  }

  async findOne(order_id: number): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
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
}
