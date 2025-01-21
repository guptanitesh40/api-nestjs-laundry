import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addHours } from 'date-fns';
import * as fs from 'fs';
import { Response } from 'src/dto/response.dto';
import { UserAddress } from 'src/entities/address.entity';
import { Branch } from 'src/entities/branch.entity';
import { Category } from 'src/entities/category.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { CustomerOrderStatuseLabel } from 'src/enum/customer_order_status_label.enum';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { Role } from 'src/enum/role.enum';
import {
  appendBaseUrlToImages,
  appendBaseUrlToNestedImages,
} from 'src/utils/image-path.helper';
import {
  getCustomerOrderStatusLabel,
  getOrderStatusDetails,
  getWorkshopOrdersStatusLabel,
} from 'src/utils/order-status.helper';
import {
  getOrderInvoiceFileFileName,
  getOrderLabelFileFileName,
  getPdfUrl,
  getRefundFileFileName,
} from 'src/utils/pdf-url.helper';
import { DataSource, In, Repository } from 'typeorm';
import { RazorpayService } from '../../razorpay/razorpay.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';
import { OrderFilterDto } from '../dto/orders-filter.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { CreateNoteDto } from '../notes/dto/create-note.dto';
import { NotesService } from '../notes/note.service';
import { NotificationService } from '../notification/notification.service';
import { PriceService } from '../price/price.service';
import { SettingService } from '../settings/setting.service';
import { UserService } from '../user/user.service';
import { WorkshopService } from '../workshop/workshop.service';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { ClearDueAmount } from './dto/clear-due-amount.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { DeliveryOrderDto } from './dto/delivery-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly settingService: SettingService,
    private readonly priceService: PriceService,
    private readonly workshopService: WorkshopService,
    private readonly cartService: CartService,
    private readonly notesService: NotesService,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly razorpayService: RazorpayService,
    private dataSource: DataSource,
  ) {}

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

      await queryRunner.manager.findOne(Branch, {
        where: { branch_id: createOrderDto.branch_id, deleted_at: null },
      });

      const address_details = `${address.building_number}, ${address.area}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;

      const addess_type = address.address_type;

      const settingKeys = [
        'estimate_pickup_normal_hour',
        'estimate_pickup_express_hour',
        'estimate_delivery_normal_day',
        'estimate_delivery_express_day',
        'gst_percentage',
      ];
      const settingsResponse = await this.settingService.findAll(settingKeys);
      const settings = settingsResponse.data;

      let coupon_discount = 0;
      const coupon_code = createOrderDto.coupon_code;

      const gst_percentage = parseFloat(settings['gst_percentage'] || 0);
      const gst_amount = (createOrderDto.sub_total * gst_percentage) / 100;
      const total =
        createOrderDto.sub_total +
        createOrderDto.shipping_charges +
        (createOrderDto.express_delivery_charges || 0);
      const paid_amount = createOrderDto.paid_amount || 0;
      let kasar_amount = 0;

      if (
        createOrderDto.payment_type === PaymentType.CASH_ON_DELIVERY &&
        createOrderDto.payment_status === PaymentStatus.FULL_PAYMENT_RECEIVED
      ) {
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

      const uniquePriceKeys = createOrderDto.items.map(
        (item) => `${item.category_id}_${item.product_id}_${item.service_id}`,
      );
      const pricesResponse = await this.priceService.findAll(uniquePriceKeys);

      const orderItemsMap = new Map();
      const mismatchedPrices = [];

      for (const item of createOrderDto.items) {
        const key = `${item.category_id}_${item.product_id}_${item.service_id}`;
        const prices = pricesResponse.data[key];

        if (!prices) {
          mismatchedPrices.push(
            `Price not available for category: ${item.category_id}, product: ${item.product_id}, service: ${item.service_id}`,
          );
        } else if (item.price !== prices) {
          mismatchedPrices.push(
            `Price mismatch for category: ${item.category_id}, product: ${item.product_id}, service: ${item.service_id}. Expected: ${prices}, Received: ${item.price}`,
          );
        }

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

      if (mismatchedPrices.length > 0) {
        throw new Error(
          `Price validation failed:\n${mismatchedPrices.join('\n')}`,
        );
      }

      let calculatedSubTotal = 0;
      for (const item of orderItemsMap.values()) {
        calculatedSubTotal += item.price * item.quantity;
      }

      if (coupon_code) {
        const couponValidation = await this.couponService.applyCoupon(
          { coupon_code: coupon_code, order_Total: calculatedSubTotal },
          createOrderDto.user_id,
        );
        coupon_discount = couponValidation.data.discountAmount;
        calculatedSubTotal -= coupon_discount;
      }
      if (calculatedSubTotal !== createOrderDto.sub_total) {
        throw new Error(
          'Sub-total mismatch: Please verify item prices and quantities.',
        );
      }

      const order = this.orderRepository.create({
        ...createOrderDto,
        sub_total: calculatedSubTotal,
        gst: gst_amount,
        total,
        coupon_code,
        coupon_discount,
        address_details,
        kasar_amount,
        paid_amount,
        address_type: addess_type,
        payment_status: createOrderDto.payment_status,
        estimated_pickup_time,
        estimated_delivery_time: estimated_delivery_date,
        branch_id: createOrderDto.branch_id,
        transaction_id: createOrderDto?.transaction_id,
      });

      if (createOrderDto.payment_type === PaymentType.ONLINE_PAYMENT) {
        if (!createOrderDto.created_by_user_id) {
          const razorPayTransaction =
            await this.razorpayService.findTransactionByOrderId(
              createOrderDto.transaction_id,
            );

          if (!razorPayTransaction) {
            throw new NotFoundException(
              `Razorpay transaction with ID ${createOrderDto.transaction_id} not found`,
            );
          }

          if (razorPayTransaction.amount !== createOrderDto.paid_amount) {
            throw new BadRequestException(
              `Paid amount does not match the expected amount. Expected: ${razorPayTransaction.amount}, Received: ${createOrderDto.paid_amount}`,
            );
          }
          createOrderDto.transaction_id = razorPayTransaction.razorpay_order_id;
        }
      }

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
      await this.cartService.removeCartByUser(user.user_id);

      const orderDetail = {
        order_id: savedOrder.order_id,
        total: savedOrder.total,
        created_at: savedOrder.created_at,
        address_details: savedOrder.address_details,
        total_items: orderItems.length,
        branch_id: savedOrder.branch_id,
        transaction_id: savedOrder.transaction_id || '',
        items: orderItems,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
        },
      };

      const itemsLabel =
        await this.invoiceService.generateOrderLabels(orderDetail);

      await this.notificationService.sendOrderNotification(orderDetail);

      await queryRunner.commitTransaction();

      return {
        statusCode: 200,
        message: 'Order details added successfully',
        data: {
          orderDetail,
          itemsLabel,
        },
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

  async findAll(orderFilterDto: OrderFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      order_statuses,
      customer_ids,
      branches_ids,
      pickup_boy_ids,
      delivery_boy_ids,
      payment_types,
      payment_statuses,
    } = orderFilterDto;

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
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoin('order.pickup_boy', 'pickupBoy')
      .addSelect([
        'pickupBoy.user_id',
        'pickupBoy.first_name',
        'pickupBoy.last_name',
      ])
      .leftJoin('order.delivery_boy', 'deliveryBoy')
      .addSelect([
        'deliveryBoy.user_id',
        'deliveryBoy.first_name',
        'deliveryBoy.last_name',
      ])
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
        'branch.branch_id',
        'branch.branch_name',
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

    if (order_statuses) {
      const orderstatuses: number[] = Array.isArray(order_statuses)
        ? order_statuses.map(Number)
        : [Number(order_statuses)];

      const BRANCH_NOT_ASSIGN = 111;
      const BRANCH_ASSIGN = 112;

      const specialStatuses = [BRANCH_NOT_ASSIGN, BRANCH_ASSIGN];
      const specialConditions: string[] = [];
      const normalStatuses = orderstatuses.filter(
        (status) => !specialStatuses.includes(status),
      );

      if (orderstatuses.includes(BRANCH_NOT_ASSIGN)) {
        specialConditions.push(`
          (order.order_status = :branchNotAssign 
           AND order.pickup_boy_id IS NULL 
           AND order.branch_id IS NULL)
        `);
        queryBuilder.setParameter(
          'branchNotAssign',
          OrderStatus.PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING,
        );
      }

      if (orderstatuses.includes(BRANCH_ASSIGN)) {
        specialConditions.push(`
          (order.order_status = :branchAssign 
           AND order.branch_id IS NOT NULL)
        `);
        queryBuilder.setParameter(
          'branchAssign',
          OrderStatus.PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING,
        );
      }

      if (normalStatuses.length > 0) {
        specialConditions.push('order.order_status IN (:...normalStatuses)');
        queryBuilder.setParameter('normalStatuses', normalStatuses);
      }

      if (specialConditions.length > 0) {
        queryBuilder.andWhere(specialConditions.join(' OR '));
      }
    }

    if (customer_ids) {
      queryBuilder.andWhere('order.user_id IN (:...customerIds)', {
        customerIds: customer_ids,
      });
    }

    if (branches_ids) {
      queryBuilder.andWhere('order.branch_id In (:...branchIds)', {
        branchIds: branches_ids,
      });
    }

    if (pickup_boy_ids) {
      queryBuilder.andWhere('order.pickup_boy_id In (:...pickupBoyIds)', {
        pickupBoyIds: pickup_boy_ids,
      });
    }

    if (delivery_boy_ids) {
      queryBuilder.andWhere('order.delivery_boy_id In(:...deliveryBoyIds)', {
        deliveryBoyIds: delivery_boy_ids,
      });
    }

    if (payment_types) {
      queryBuilder.andWhere('order.payment_type In(:...paymentTypes)', {
        paymentTypes: payment_types,
      });
    }

    if (payment_statuses) {
      queryBuilder.andWhere('order.payment_status In(:...paymentStatuses)', {
        paymentStatuses: payment_statuses,
      });
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

    const [orders, total]: any = await queryBuilder.getManyAndCount();
    orders.map((order) => {
      if (order.total > order.paid_amount) {
        order.pending_due_amount = order.total - order.paid_amount;
      }
      order.order_status_details = getOrderStatusDetails(order);
      order.pickup_boy = order.pickup_boy_id
        ? {
            id: order.pickup_boy_id,
            name: `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim(),
          }
        : null;

      order.delivery_boy = order.delivery_boy_id
        ? {
            id: order.delivery_boy_id,
            name: `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim(),
          }
        : null;

      order.order_invoice = getPdfUrl(
        order.order_id,
        getOrderInvoiceFileFileName(),
      );
    });

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
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'items')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('items.category', 'category')
      .innerJoinAndSelect('items.product', 'product')
      .innerJoinAndSelect('items.service', 'service')
      .leftJoinAndSelect('order.workshop', 'workshop')
      .leftJoinAndSelect('workshop.workshopManagerMappings', 'mapping')
      .leftJoinAndSelect('mapping.user', 'manager_user')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.notes', 'notes')
      .leftJoinAndSelect('notes.user', 'note_user')
      .leftJoin('order.pickup_boy', 'pickupBoy')
      .addSelect([
        'pickupBoy.user_id',
        'pickupBoy.first_name',
        'pickupBoy.last_name',
      ])
      .leftJoin('order.delivery_boy', 'deliveryBoy')
      .addSelect([
        'deliveryBoy.user_id',
        'deliveryBoy.first_name',
        'deliveryBoy.last_name',
      ])
      .where('order.order_id = :order_id', { order_id })
      .andWhere('order.deleted_at IS NULL')
      .select([
        'order',
        'notes',
        'note_user.first_name',
        'note_user.last_name',
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
        'workshop',
        'mapping.workshop_manager_mapping_id',
        'manager_user.first_name',
        'manager_user.last_name',
        'branch.branch_id',
        'branch.branch_name',
        'pickupBoy.user_id',
        'pickupBoy.first_name',
        'pickupBoy.last_name',
        'deliveryBoy.user_id',
        'deliveryBoy.first_name',
        'deliveryBoy.last_name',
      ]);

    const orders: any = await queryBuilder.getOne();

    if (!orders) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    if (orders.refund_amount !== null) {
      orders.refund_receipt_url = getPdfUrl(
        orders.order_id,
        getRefundFileFileName(),
      );
    }

    const order_invoice = getPdfUrl(
      orders.order_id,
      getOrderInvoiceFileFileName(),
    );

    const file = fs.existsSync(order_invoice.fileName);

    orders.order_invoice = file ? order_invoice : '';

    orders.order_status_details = getOrderStatusDetails(orders);

    orders.order_label = getPdfUrl(
      orders.order_id,
      getOrderLabelFileFileName(),
    );

    if (orders.total > orders.paid_amount) {
      orders.pending_due_amount = orders.total - orders.paid_amount;
    }
    orders.workshop_status_name = getWorkshopOrdersStatusLabel(
      orders.order_status,
    );

    orders.pickup_boy = orders.pickup_boy_id
      ? {
          pickup_boy__id: orders.pickup_boy_id,
          pickup_boy_name:
            `${orders.pickup_boy?.first_name || ''} ${orders.pickup_boy?.last_name || ''}  `.trim(),
        }
      : null;

    orders.delivery_boy = orders.delivery_boy_id
      ? {
          delivery_boy_id: orders.delivery_boy_id,
          delivery_boy_name:
            `${orders.delivery_boy?.first_name || ''} ${orders.delivery_boy?.last_name || ''}`.trim(),
        }
      : null;

    const order = appendBaseUrlToNestedImages(orders);

    return {
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: { orders: order },
    };
  }

  async updateOrder(
    order_id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    const order = await this.orderRepository.findOne({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const { address_id, items, ...orderUpdates } = updateOrderDto;

    if (
      orderUpdates.payment_type === PaymentType.CASH_ON_DELIVERY &&
      orderUpdates.payment_status === PaymentStatus.FULL_PAYMENT_RECEIVED
    ) {
      orderUpdates.kasar_amount =
        order.total > order.paid_amount ? order.total - order.paid_amount : 0;
    }

    if (address_id) {
      const address = await this.dataSource.manager.findOne(UserAddress, {
        where: { address_id },
      });
      if (!address) {
        throw new NotFoundException(`Address with id ${address_id} not found`);
      }
      order.address_details = `${address.building_number}, ${address.area}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`;
    }

    if (updateOrderDto.branch_id) {
      const branch = await queryRunner.manager.findOne(Branch, {
        where: { branch_id: updateOrderDto.branch_id, deleted_at: null },
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch with id ${updateOrderDto.branch_id} not found`,
        );
      }
      order.branch_id = updateOrderDto.branch_id;
    }

    const settingKeys = ['gst_percentage'];
    const settingsResponse = await this.settingService.findAll(settingKeys);
    const settings = settingsResponse.data;
    const gst_percentage = parseFloat(settings['gst_percentage'] || 0);

    const sub_total = updateOrderDto.sub_total;
    const gst_amount = (sub_total * gst_percentage) / 100;
    const total =
      sub_total +
      (updateOrderDto.shipping_charges || 0) +
      (updateOrderDto.express_delivery_charges || 0);
    order.sub_total = sub_total;
    order.gst = gst_amount;
    order.total = total;
    order.branch_id, Object.assign(order, orderUpdates);

    const updatedOrder = await this.dataSource.manager.save(order);

    if (items) {
      await this.dataSource.manager.delete(OrderItem, { order: { order_id } });

      const prices = await this.priceService.findAll();
      const orderItemsMap = new Map();

      for (const item of items) {
        const key = `${item.category_id}_${item.product_id}_${item.service_id}`;
        const price = prices.data[key];

        if (!price) {
          throw new Error(
            `Price not available for category: ${item.category_id}, product: ${item.product_id}, service: ${item.service_id}`,
          );
        } else if (item.price !== price) {
          throw new Error(
            `Price not available for category: ${item.category_id}, product: ${item.product_id}, service: ${item.service_id}. Expected: ${price}, Received: ${item.price}`,
          );
        }
        if (orderItemsMap.has(key)) {
          const existingItem = orderItemsMap.get(key);
          existingItem.quantity += item.quantity || 1;
        } else {
          orderItemsMap.set(key, {
            category_id: item.category_id,
            product_id: item.product_id,
            service_id: item.service_id,
            description: item.description,
            price: item.price,
            quantity: item.quantity || 1,
          });
        }
      }

      const orderItems = Array.from(orderItemsMap.values()).map((item) => ({
        order: updatedOrder,
        ...item,
      }));

      for (const orderItem of orderItems) {
        await this.dataSource.manager.insert(OrderItem, orderItem);
      }
    }

    const data = (await this.getOrderDetail(order.order_id)).data;

    await this.invoiceService.generateAndSaveInvoicePdf(order_id);

    const refundReceipt = await this.invoiceService.generateOrderLabels(data);

    return {
      statusCode: 200,
      message: 'Order updated successfully',
      data: {
        order_id: updatedOrder.order_id,
        branch_id: updatedOrder.branch_id,
        total: updatedOrder.total,
        address_details: updatedOrder.address_details,
        items: items ? items.length : 0,
        url: refundReceipt,
      },
    };
  }

  async updateOrderStatus(order_id: number, status: OrderStatus): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    switch (status) {
      case OrderStatus.ASSIGNED_PICKUP_BOY:
        if (
          order.order_status !==
          OrderStatus.PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING
        ) {
          throw new BadRequestException(
            'Cannot mark as Items Received by Pickup Boy. Previous status must be Pickup Pending.',
          );
        }
        break;

      case OrderStatus.PICKUP_COMPLETED_BY_PICKUP_BOY:
        if (order.order_status !== OrderStatus.ASSIGNED_PICKUP_BOY) {
          throw new BadRequestException(
            'Cannot mark as Items Received at Branch. Previous status must be Items Received by Pickup Boy.',
          );
        }
        break;

      case OrderStatus.ITEMS_RECEIVED_AT_BRANCH:
        if (order.order_status !== OrderStatus.PICKUP_COMPLETED_BY_PICKUP_BOY) {
          throw new BadRequestException(
            'Cannot mark as Workshop Received Items. Previous status must be Items Received at Branch.',
          );
        }
        break;

      case OrderStatus.WORKSHOP_ASSIGNED:
        if (order.order_status !== OrderStatus.ITEMS_RECEIVED_AT_BRANCH) {
          throw new BadRequestException(
            'Cannot mark as Workshop In Process. Previous status must be Workshop Received Items.',
          );
        }
        break;

      case OrderStatus.WORKSHOP_RECEIVED_ITEMS:
        if (order.order_status !== OrderStatus.WORKSHOP_ASSIGNED) {
          throw new BadRequestException(
            'Cannot mark as Workshop Completed. Previous status must be Workshop In Process.',
          );
        }
        break;

      case OrderStatus.DELIVERED:
        if (
          order.order_status !==
          OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY
        ) {
          throw new BadRequestException(
            'Cannot mark as Delivered. Previous status must be Delivery Boy Marks As Completed.',
          );
        }
        break;

      case OrderStatus.CANCELLED:
        if (order.order_status === OrderStatus.DELIVERED) {
          throw new BadRequestException(
            'Cannot cancel an order that has been delivered.',
          );
        }
        break;

      default:
        break;
    }

    order.order_status = status;
    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Order status updated successfully',
      orderId: order_id,
      orderStatus: status,
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
    order.order_status =
      OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Delivery boy assigned successfully',
    };
  }

  async getOrderDetail(order_id: number): Promise<Response> {
    const orderQuery = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.items', 'items')
      .innerJoinAndSelect('items.category', 'category')
      .innerJoinAndSelect('items.product', 'product')
      .innerJoinAndSelect('items.service', 'service')
      .leftJoinAndSelect('order.branch', 'branch')
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
        'branch.branch_name',
        'branch.branch_phone_number',
      ])
      .groupBy(
        'order.order_id, items.item_id, category.category_id, product.product_id, service.service_id',
      );
    const order: any = await orderQuery.getOne();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.order_invoice = getPdfUrl(
      order.order_id,
      getOrderInvoiceFileFileName(),
    );

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

  async getAll(
    user_id: number,
    paginationQueryDto: PaginationQueryDto,
    orderStatus?: CustomerOrderStatuseLabel,
  ): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'items')
      .where('order.user_id = :user_id', { user_id: user_id })
      .andWhere('order.deleted_at IS NULL')
      .select([
        'order.order_id',
        'order.user_id',
        'order.total',
        'order.paid_amount',
        'order.kasar_amount',
        'order.order_status',
        'order.payment_status',
        'order.estimated_delivery_time',
        'order.created_at',
        'items',
      ])
      .groupBy('order.order_id,items.item_id')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(order.order_id LIKE :search OR ' +
          'order.created_at LIKE :search OR ' +
          'order.estimated_delivery_time LIKE :search OR ' +
          'order.total LIKE :search OR ' +
          'order.paid_amount LIKE :search OR ' +
          'order.kasar_amount LIKE :search OR ' +
          'order.payment_status LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (orderStatus === CustomerOrderStatuseLabel.NEW) {
      queryBuilder.andWhere('order.order_status In (:...orderStatuses)', {
        orderStatuses: [
          OrderStatus.PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING,
          OrderStatus.ASSIGNED_PICKUP_BOY,
          OrderStatus.PICKUP_COMPLETED_BY_PICKUP_BOY,
        ],
      });
    }

    if (orderStatus === CustomerOrderStatuseLabel.PENDING) {
      queryBuilder.andWhere('order.order_status In (:...orderStatuses)', {
        orderStatuses: [
          OrderStatus.ITEMS_RECEIVED_AT_BRANCH,
          OrderStatus.WORKSHOP_ASSIGNED,
          OrderStatus.WORKSHOP_RECEIVED_ITEMS,
          OrderStatus.WORKSHOP_WORK_IN_PROGRESS,
          OrderStatus.WORKSHOP_WORK_IS_COMPLETED,
          OrderStatus.ORDER_COMPLETED_AND_RECEIVED_AT_BRANCH,
        ],
      });
    }

    if (orderStatus === CustomerOrderStatuseLabel.COMPLETED) {
      queryBuilder.andWhere('order.order_status In (:...orderStatuses)', {
        orderStatuses: [
          OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY,
          OrderStatus.DELIVERED,
        ],
      });
    }

    let sortColumn = 'order.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';
    if (sort_by) {
      sortColumn = `order.${sort_by}`;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total]: any = await queryBuilder.getManyAndCount();
    result.map((order) => {
      order.order_status_name = getCustomerOrderStatusLabel(
        order.order_status,
        order.branch_id,
        order.pickup_boy_id,
        order.workshop_id,
      );
    });

    const inProgressCountOrder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.user_id=:user_id', { user_id: user_id })
      .andWhere(
        'order.order_status != :excludedDelivered AND order.order_status != :excludedCancelled',
        {
          excludedDelivered: OrderStatus.DELIVERED,
          excludedCancelled: OrderStatus.CANCELLED,
        },
      )

      .andWhere('order.deleted_at IS NULL');
    const inProgressCount = await inProgressCountOrder.getCount();

    const totalPendingAmount = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.user_id=:user_id', { user_id: user_id })
      .andWhere('order.deleted_at IS NULL')
      .select(
        'SUM(order.total - order.paid_amount - order.kasar_amount - order.refund_amount)',
        'total_pending_due_amount',
      )
      .addSelect('SUM(order.total) as total')
      .addSelect('SUM(order.paid_amount) as paid_amount')
      .addSelect('SUM(order.kasar_amount) as kasar_amount')
      .getRawOne();

    return {
      statusCode: 200,
      message: 'Orders retrieved',
      data: {
        result,
        limit: perPage,
        page_number: pageNumber,
        count: total,
        inProgressCount,
        totalPendingAmount,
      },
    };
  }

  async getOrderInvoiceList(
    user_id: number,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    const { per_page, page_number } = paginationQueryDto;
    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.user_id=:user_id', {
        user_id: user_id,
      })
      .andWhere('order.order_status= :status', {
        status: OrderStatus.DELIVERED,
      })
      .andWhere('order.total > order.paid_amount')
      .andWhere('order.refund_status !=:refundStatus ', {
        refundStatus: RefundStatus.FULL,
      })
      .andWhere('order.deleted_at IS NULL')
      .select([
        'order.order_id',
        'order.total',
        'order.paid_amount',
        'order.payment_status',
        'order.transaction_id',
      ])
      .take(perPage)
      .skip(skip);

    const [result, total]: any = await queryBuilder.getManyAndCount();

    result.map((order) => {
      order.order_invoice = getPdfUrl(
        order.order_id,
        getOrderInvoiceFileFileName(),
      );
    });

    const orders = this.orderRepository
      .createQueryBuilder('order')
      .where('order.user_id=:user_id', { user_id: user_id })
      .andWhere('order.deleted_at IS NULL')
      .andWhere('order.total > order.paid_amount')
      .andWhere('order.refund_status !=:refundStatus ', {
        refundStatus: RefundStatus.FULL,
      })
      .andWhere('order.order_status= :status', {
        status: OrderStatus.DELIVERED,
      })
      .select([
        'order.order_id as order_id',
        'SUM(order.total - order.paid_amount - order.kasar_amount - order.refund_amount) as total_pending_due_amount',
      ])
      .groupBy('order.order_id');
    const orderData = await orders.getRawMany();

    const order_ids = [];
    let totalPendingAmount = 0;
    orderData.map((order) => {
      order_ids.push(order.order_id);
      totalPendingAmount += order.total_pending_due_amount;
    });

    return {
      statusCode: 200,
      message: 'orders invoice retrived successfully',
      data: {
        result,
        order_ids,
        totalPendingAmount,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async clearCustomerDue(
    clearDueAmount: ClearDueAmount,
    user_id: number,
  ): Promise<Response> {
    const orders = await this.orderRepository.find({
      where: {
        order_id: In(clearDueAmount.order_ids),
        user_id: user_id,
      },
    });

    let total_pending_amount = 0;
    orders.map((order) => {
      total_pending_amount +=
        order.total -
        order.paid_amount -
        order.kasar_amount -
        order.refund_amount;
    });

    if (clearDueAmount.pay_amount !== total_pending_amount) {
      throw new BadRequestException(
        'You cannot pay more than the total pending due amount',
      );
    }

    if (clearDueAmount.payment_status !== PaymentStatus.FULL_PAYMENT_RECEIVED) {
      throw new BadRequestException('You cannot mark as full payment received');
    }

    const razorPay = await this.razorpayService.findTransactionByOrderId(
      clearDueAmount.transaction_id,
    );

    if (!razorPay) {
      throw new NotFoundException(
        `Razorpay transaction with ID ${clearDueAmount.transaction_id} not found`,
      );
    }

    const updatedOrders = [];

    for (const order of orders) {
      let due_amount = 0;

      due_amount =
        order.total -
          order.paid_amount -
          order.kasar_amount -
          order.refund_amount || 0;

      order.paid_amount += due_amount;
      order.payment_status = clearDueAmount.payment_status;

      order.transaction_id = order.transaction_id
        ? `${order.transaction_id}, ${clearDueAmount.transaction_id}`
        : clearDueAmount.transaction_id;

      updatedOrders.push(order);
    }

    await this.orderRepository.save(updatedOrders);

    return {
      statusCode: 200,
      message: 'Payment applied successfully',
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
      .where(
        '(order.pickup_boy_id = :delivery_boy_id OR order.delivery_boy_id = :delivery_boy_id)',
        { delivery_boy_id },
      )
      .andWhere(
        '(order.order_status != :excludedPickupStatus AND order.order_status != :excludedDeliveryStatus)',
        {
          excludedPickupStatus: OrderStatus.ITEMS_RECEIVED_AT_BRANCH,
          excludedDeliveryStatus: OrderStatus.DELIVERED,
        },
      )
      .andWhere('order.order_status IN(:...deliveredStatus)', {
        deliveredStatus: [
          OrderStatus.ASSIGNED_PICKUP_BOY,
          OrderStatus.PICKUP_COMPLETED_BY_PICKUP_BOY,
          OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY,
        ],
      })
      .select([
        'order.order_id As order_id',
        'order.delivery_boy_id As delivery_boy_id',
        'order.pickup_boy_id As pickup_boy_id',
        'order.order_status As order_status',
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
      message:
        'Orders with assigned delivery boys or pickup boys retrieved successfully',
      data: ordersWithAssignedDeliveryBoys,
    };
  }

  async assignBranch(order_id: number, branch_id: number): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const branch = await this.orderRepository.findOne({
      where: { branch_id: branch_id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id ${branch_id} not found`);
    }

    order.branch_id = branch.branch_id;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Branch assigned successfully',
    };
  }

  async assignWorkshop(
    order_id: number,
    workshop_id: number,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const workshop = await this.workshopService.findOne(workshop_id);

    if (!workshop) {
      throw new NotFoundException(`Workshop with id ${workshop_id} not found`);
    }

    order.workshop_id = workshop_id;
    order.order_status = OrderStatus.WORKSHOP_ASSIGNED;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'Workshop assigned successfully',
    };
  }

  async assignPickupBoy(
    order_id: number,
    pickup_boy_id: number,
    comment: string,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const pickupBoy = await this.userService.findOneByRole(
      pickup_boy_id,
      Role.DELIVERY_BOY,
    );

    if (!pickupBoy) {
      throw new NotFoundException(
        `Pickup boy with id ${pickup_boy_id} not found`,
      );
    }

    order.pickup_boy_id = pickupBoy.user_id;
    order.pickup_comment = comment;
    order.order_status = OrderStatus.ASSIGNED_PICKUP_BOY;

    await this.orderRepository.save(order);

    return {
      statusCode: 200,
      message: 'pickupBoy assigned successfully',
    };
  }

  async updateOrderPickupAndDeliveryStatus(
    order_id: number,
    user_id: number,
    deliveryOrderDto: DeliveryOrderDto,
    imagePaths: string[],
    status: OrderStatus,
    statusMessage: string,
  ): Promise<Response> {
    const order: any = await this.orderRepository.findOne({
      where: { order_id, user_id: user_id },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.order_status = status;
    order.order_status_details = getOrderStatusDetails(order);
    await this.orderRepository.save(order);

    const noteDto: CreateNoteDto = {
      user_id,
      order_id,
      text_note: deliveryOrderDto.deliveryNote,
      images: deliveryOrderDto.images,
    };

    const note = await this.notesService.create(noteDto, imagePaths);

    return {
      statusCode: 200,
      message: statusMessage,
      data: { order, note },
    };
  }

  async deliveryComplete(
    user_id: number,
    order_id: number,
    deliveryOrderDto: DeliveryOrderDto,
    imagePaths: string[],
  ): Promise<Response> {
    return this.updateOrderPickupAndDeliveryStatus(
      user_id,
      order_id,
      deliveryOrderDto,
      imagePaths,
      OrderStatus.DELIVERED,
      'Order delivery confirmed successfully',
    );
  }

  async pickupComplete(
    user_id: number,
    order_id: number,
    deliveryOrderDto: DeliveryOrderDto,
    imagePaths: string[],
  ): Promise<Response> {
    return this.updateOrderPickupAndDeliveryStatus(
      user_id,
      order_id,
      deliveryOrderDto,
      imagePaths,
      OrderStatus.ITEMS_RECEIVED_AT_BRANCH,
      'Order Pickup Confirmed successfully',
    );
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

  async getAllAssignWorkshopOrders(
    orderFilterDto: OrderFilterDto,
  ): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      order_statuses,
      customer_ids,
      branches_ids,
      pickup_boy_ids,
      payment_types,
      payment_statuses,
      workshop_ids,
      workshop_manager_ids,
    } = orderFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .innerJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.branch', 'branch')
      .innerJoinAndSelect('order.workshop', 'workshop')
      .innerJoinAndSelect('workshop.workshopManagerMappings', 'mapping')
      .leftJoinAndSelect('mapping.user', 'manager_user')
      .select([
        'order',
        'workshop',
        'items',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
        'branch.branch_id',
        'branch.branch_name',
        'mapping.workshop_manager_mapping_id',
        'manager_user.user_id',
        'manager_user.first_name',
        'manager_user.last_name',
      ])
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.where(
        '(order.description LIKE :search OR ' +
          'order.coupon_code LIKE :search OR ' +
          'order.address_details LIKE :search OR ' +
          'user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search OR ' +
          'workshop.workshop_name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (order_statuses) {
      queryBuilder.andWhere('order.order_status IN (:...ordersStatuses)', {
        ordersStatuses: order_statuses,
      });
    } else {
      queryBuilder.andWhere(
        'order.order_status BETWEEN :minStatus AND :maxStatus',
        {
          minStatus: OrderStatus.PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING,
          maxStatus: OrderStatus.WORKSHOP_WORK_IS_COMPLETED,
        },
      );
    }

    if (customer_ids) {
      queryBuilder.andWhere('order.user_id IN (:...customerIds)', {
        customerIds: customer_ids,
      });
    }

    if (branches_ids) {
      queryBuilder.andWhere('order.branch_id In (:...branchIds)', {
        branchIds: branches_ids,
      });
    }

    if (pickup_boy_ids) {
      queryBuilder.andWhere('order.pickup_boy_id In (:...pickupBoyIds)', {
        pickupBoyIds: pickup_boy_ids,
      });
    }

    if (payment_types) {
      queryBuilder.andWhere('order.payment_type In (:...paymentTypes)', {
        paymentTypes: payment_types,
      });
    }

    if (payment_statuses) {
      queryBuilder.andWhere('order.payment_status In (:...paymentStatuses)', {
        paymentStatuses: payment_statuses,
      });
    }

    if (workshop_ids) {
      queryBuilder.andWhere('workshop.workshop_id In(:...workshopIds)', {
        workshopIds: workshop_ids,
      });
    }

    if (workshop_manager_ids) {
      queryBuilder.andWhere('manager_user.user_id In(:...workshopManagerId)', {
        workshopManagerId: workshop_manager_ids,
      });
    }

    let sortColumn = 'order.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      const sortableColumns: { [key: string]: string } = {
        first_name: 'user.first_name',
        last_name: 'user.last_name',
        email: 'user.email',
        mobile_number: 'user.mobile_number',
        workshop_name: 'workshop.workshop_name',
        workshop_id: 'workshop.workshop_id',
      };

      sortColumn = sortableColumns[sort_by] ?? `order.${sort_by}`;
    }

    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [workshopOrders, total]: any = await queryBuilder.getManyAndCount();

    workshopOrders.map((order) => {
      order.workshop_status_name = getWorkshopOrdersStatusLabel(
        order.order_status,
      );
    });

    return {
      statusCode: 200,
      message: 'All assigned orders with workshop',
      data: {
        workshopOrders,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async createRefund(refundOrderDto: RefundOrderDto): Promise<Response> {
    const order = (await this.getOrderDetail(refundOrderDto.order_id))?.data;

    if (order.refund_amount > 0) {
      throw new BadRequestException(
        'Refund has already been processed for this order.',
      );
    }

    if (order.order_status == OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot refund a cancelled order');
    }

    let newRefundAmount = 0;

    if (refundOrderDto.refund_status === RefundStatus.FULL) {
      newRefundAmount = order.total;
    } else if (refundOrderDto.refund_status === RefundStatus.PARTIAL) {
      if (refundOrderDto.refund_amount > order.total) {
        throw new BadRequestException(
          'Refund amount cannot exceed order total',
        );
      }
      newRefundAmount = refundOrderDto.refund_amount;
    }

    order.refund_amount = newRefundAmount;
    order.refund_status = refundOrderDto.refund_status;
    order.refund_descriptions = refundOrderDto.refund_description;
    await this.orderRepository.save(order);

    const refundReceipt =
      await this.invoiceService.generateRefundReceipt(order);

    return {
      statusCode: 200,
      message: 'Refund created successfully',
      data: { order, refundReceipt },
    };
  }

  async countOrdersByCondition(condition: object): Promise<number> {
    return this.orderRepository.count({ where: condition });
  }

  async payDueAmount(
    user_id: number,
    orders: Array<{
      order_id: number;
      paid_amount: number;
      payment_status: number;
      kasar_amount: number;
    }>,
  ): Promise<Response> {
    const user = await this.userService.findUserById(user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedOrders = [];

    const orders_ids = orders.map((order) => order.order_id);

    const orderdata = await this.orderRepository.find({
      where: {
        order_id: In(orders_ids),
        user_id: user_id,
      },
    });

    for (const orderData of orders) {
      const order = orderdata.find((o) => o.order_id === orderData.order_id);

      if (!order) {
        throw new NotFoundException(
          `Order with ID ${orderData.order_id} not found`,
        );
      }

      const dueAmount =
        order.total -
        order.paid_amount -
        (order.kasar_amount || 0) -
        (order.refund_amount || 0);

      if (dueAmount <= 0) {
        throw new BadRequestException(
          `No pending due amount for order ${orderData.order_id}`,
        );
      }

      if (order.refund_status === RefundStatus.FULL) {
        throw new BadRequestException(
          `This order ${orderData.order_id} is fully refunded`,
        );
      }

      if (
        orderData.payment_status === PaymentStatus.FULL_PAYMENT_RECEIVED &&
        orderData.paid_amount + orderData.kasar_amount + order.paid_amount !=
          order.total
      ) {
        throw new BadRequestException(
          `Total payment for this order is not matching with order ${order.order_id} total amount`,
        );
      }

      if (
        orderData.payment_status === PaymentStatus.PARTIAL_PAYMENT_RECEIVED &&
        orderData.paid_amount + orderData.kasar_amount + order.paid_amount >=
          order.total
      ) {
        throw new BadRequestException(
          `you can not pay more than total order amount as partial paymnet `,
        );
      }
      order.paid_amount += orderData.paid_amount;
      order.kasar_amount = orderData.kasar_amount;

      order.payment_status = orderData.payment_status;

      updatedOrders.push(order);
    }

    await this.orderRepository.save(updatedOrders);

    const updateOrders = updatedOrders.map((order) => ({
      order_id: order.order_id,
      total_amount: order.total,
      paid_amount: order.paid_amount,
      kasar_amount: order.kasar_amount,
      payment_status: order.payment_status,
      pending_amount:
        order.total -
        order.paid_amount -
        order.kasar_amount -
        order.refund_amount,
    }));

    return {
      statusCode: 200,
      message: 'Payment applied successfully',
      data: {
        orders: updateOrders,
      },
    };
  }

  async cancelOrder(
    cancelOrderDto: CancelOrderDto,
    user_id: number,
  ): Promise<Response> {
    const order = await this.orderRepository.findOne({
      where: { order_id: cancelOrderDto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order Not Found');
    }

    if (order.order_status === OrderStatus.DELIVERED) {
      throw new NotFoundException(
        'This order is not canceled; it has already been delivered.',
      );
    }

    order.order_status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    const note: CreateNoteDto = {
      user_id,
      order_id: cancelOrderDto.order_id,
      text_note: cancelOrderDto.text_note,
    };

    const notes = await this.notesService.create(note);

    return {
      statusCode: 200,
      message: 'Order Cancelled Successfully',
      data: {
        order,
        notes,
      },
    };
  }
}
