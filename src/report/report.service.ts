import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from 'src/entities/feedback.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { Role } from 'src/enum/role.enum';
import { convertDateParameters } from 'src/utils/date-formatted.helper';
import { Repository } from 'typeorm';
import { UserService } from '../modules/user/user.service';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly userService: UserService,
  ) {}

  private convertCountToNumber(arr) {
    return arr.map((c) => {
      c.count = Number(c.count);
      return c;
    });
  }

  async getTotalOrderReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS month")
      .addSelect('COUNT(*) AS count')
      .addSelect('SUM(orders.total) AS total_amount')
      .addSelect(
        'SUM(orders.total - orders.paid_amount - orders.kasar_amount - orders.refund_amount) AS pending_amount',
      )
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefundStatus', {
        excludeRefundStatus: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);

    result.map((r) => {
      r.total_amount = Number(r.total_amount.toFixed(2));
      r.pending_amount = Number(r.pending_amount.toFixed(2));
    });

    return result;
  }

  async getTotalOrderExcelReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<{ data: any[]; totals: any }> {
    const { startDate, endDate, user_id, company_id, branch_id } =
      reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        'customer.user_id AS customer_id',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.gst_company_name AS customer_company_name',
        'orders.gstin AS customer_gstin',
        'DATE_FORMAT(orders.created_at, "%Y-%m-%d") AS booking_date',
        'DATE_FORMAT(orders.estimated_pickup_time, "%Y-%m-%d") AS pickup_date',
        'DATE_FORMAT(orders.estimated_delivery_time, "%Y-%m-%d") AS delivery_date',
        'orders.paid_amount AS paid_amount',
        'orders.total AS total_amount',
        'orders.address_details AS address_details',
        'orders.payment_status AS payment_status',
        '(orders.total - orders.paid_amount - orders.kasar_amount - orders.refund_amount) AS pending_amount',
        'orders.payment_type AS payment_type',
        'orders.kasar_amount AS kasar_amount',
      ])
      .where('orders.deleted_at IS NULL')
      .andWhere('customer.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefundStatus', {
        excludeRefundStatus: RefundStatus.FULL,
      });

    if (user_id) {
      queryBuilder.andWhere('orders.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    const totals = {
      total_orders: result.length,
      total_amount: 0,
      paid_amount: 0,
      kasar_amount: 0,
      pending_amount: 0,
    };

    result.forEach((item) => {
      totals.total_amount += Number(item.total_amount || 0);
      totals.paid_amount += Number(item.paid_amount || 0);
      totals.kasar_amount += Number(item.kasar_amount || 0);
      totals.pending_amount += Number(item.pending_amount || 0);
    });

    return { data: result, totals };
  }

  async getDeliveryCompletedReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at,'%b-%Y') AS month")
      .addSelect(
        `CASE WHEN orders.order_status = ${OrderStatus.DELIVERED} THEN 'Completed' ELSE 'Pending' END`,
        'status',
      )
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED],
      })
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefundStatus', {
        excludeRefundStatus: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .addGroupBy('status')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);

    return result;
  }

  async getDeliveryPendingReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at,'%b-%Y') AS month")
      .addSelect(`'Pending' AS status`)
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...completedStatuses)', {
        completedStatuses: [
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);

    return result;
  }

  async getDeliveryReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at,'%b-%y')", 'month')
      .addSelect(
        `SUM(CASE WHEN orders.order_status = :deliveredStatus THEN 1 ELSE 0 END)`,
        'completed',
      )
      .addSelect(
        `SUM(CASE WHEN orders.order_status != :deliveredStatus THEN 1 ELSE 0 END)`,
        'pending',
      )
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...cancelOrder)', {
        cancelOrder: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefundStatus', {
        excludeRefundStatus: RefundStatus.FULL,
      })
      .setParameter('deliveredStatus', OrderStatus.DELIVERED);

    if (formattedStartDate && formattedEndDate) {
      queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    result.map((n) => {
      n.completed = Number(n.completed);
      n.pending = Number(n.pending);
    });

    return result;
  }

  async getPaymentReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .addSelect(
        `SUM(CASE WHEN orders.payment_type = ${PaymentType.CASH_ON_DELIVERY} THEN 1 ELSE 0 END)`,
        'cash_on_delivery',
      )
      .addSelect(
        `SUM(CASE WHEN orders.payment_type = ${PaymentType.ONLINE_PAYMENT} THEN 1 ELSE 0 END)`,
        'online_payment',
      )
      .where('orders.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    result.map((n) => {
      n.cash_on_delivery = Number(n.cash_on_delivery);
      n.online_payment = Number(n.online_payment);
    });

    return result;
  }

  async getPendingAmountReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formatedEndDate } =
      convertDateParameters(startDate, endDate);
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(orders.total)', 'total_amount')
      .addSelect(
        'SUM(orders.total - COALESCE(orders.paid_amount,0) - COALESCE(orders.kasar_amount,0) - COALESCE(orders.refund_amount,0))',
        'pending_amount',
      )
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      })
      .andWhere('orders.payment_status IN (:...statuses)', {
        statuses: [
          PaymentStatus.PAYMENT_PENDING,
          PaymentStatus.PARTIAL_PAYMENT_RECEIVED,
        ],
      });

    if (formattedStartDate && formatedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formatedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);

    result.map((n) => {
      n.total_amount = Number(n.total_amount.toFixed(2));
      n.pending_amount = Number(n.pending_amount.toFixed(2));
    });

    return result;
  }

  async getRefundReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(orders.refund_amount)', 'total_refund_amount')
      .addSelect('SUM(orders.total)', 'total_amount')
      .where('orders.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    result.map((r) => {
      r.total_refund_amount = Number(r.total_refund_amount);
      r.total_amount = Number(r.total_amount.toFixed(2));
      r.count = Number(r.count);
    });

    return result;
  }

  async getRefundExcelReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate, company_id, branch_id } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        'customer.user_id AS customer_id',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.gst_company_name AS customer_company_name',
        'orders.gstin AS customer_gstin',
        'DATE_FORMAT(orders.created_at, "%Y-%m-%d") AS booking_date',
        'DATE_FORMAT(orders.estimated_pickup_time, "%Y-%m-%d") AS pickup_date',
        'DATE_FORMAT(orders.estimated_delivery_time, "%Y-%m-%d") AS delivery_date',
        'orders.total AS total_amount',
        'orders.address_details AS address_details',
        'orders.refund_amount AS refund_amount',
        'orders.updated_at AS refund_date',
        `CASE orders.refund_status 
        WHEN 1 THEN 'Full Refund'
        WHEN 2 THEN 'Partial Refund'
        WHEN 3 THEN 'None'
        END AS payment_status
        `,
      ])
      .where('orders.deleted_at IS NULL')
      .andWhere('customer.deleted_at IS NULL')
      .andWhere('orders.refund_amount > 0')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    return result;
  }

  async getKasarReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y')", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(orders.kasar_amount)', 'total_kasar_amount')
      .addSelect('SUM(orders.total)', 'total_order_amount')
      .where('orders.kasar_amount IS NOT NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);

    result.map((n) => {
      n.total_order_amount = Number(n.total_order_amount.toFixed(2));
    });

    return result;
  }

  async getNotActiveCustomerReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const formattedTwoMonthsAgo = twoMonthsAgo.toISOString().split('T')[0];

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.created_at, '%b-%Y') AS month")
      .addSelect('COUNT(user.user_id) AS not_active_count')
      .where('user.role_id = :customerRoleId', {
        customerRoleId: Role.CUSTOMER,
      })
      .andWhere('user.created_at <= :twoMonthsAgo', {
        twoMonthsAgo: formattedTwoMonthsAgo,
      })
      .andWhere('user.deleted_at IS NULL')
      .andWhere(
        `user.user_id NOT IN (
          SELECT DISTINCT orders.user_id 
          FROM orders 
          WHERE orders.created_at >= :twoMonthsAgo 
          AND orders.deleted_at IS NULL
        )`,
        { twoMonthsAgo: formattedTwoMonthsAgo },
      );

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'user.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(user.created_at)', 'ASC')
      .getRawMany();

    result.forEach((c) => {
      c.not_active_count = Number(c.not_active_count);
    });

    return result;
  }

  async getNotActiveCustomerExcelReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate, user_id, company_id, branch_id } =
      reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const formattedTwoMonthsAgo = twoMonthsAgo.toISOString().split('T')[0];

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.orders', 'order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.company', 'company')
      .select([
        'order.gst_company_name AS customer_company_name',
        'user.user_id AS user_id',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        'order.address_details AS address_details',
        "CONCAT(user.first_name, ' ', user.last_name) AS customer_name",
        'order.gstin AS customer_gstin',
      ])
      .addSelect(
        `(SELECT DATE_FORMAT(MAX(o.created_at), '%d-%m-%y') 
          FROM orders o 
          WHERE o.user_id = user.user_id 
            AND o.deleted_at IS NULL
        ) AS last_order_date`,
      )
      .where('user.role_id = :customerRoleId', {
        customerRoleId: Role.CUSTOMER,
      })
      .andWhere('user.created_at <= :twoMonthsAgo', {
        twoMonthsAgo: formattedTwoMonthsAgo,
      })
      .andWhere('user.deleted_at IS NULL')
      .andWhere(
        `user.user_id NOT IN (
          SELECT DISTINCT orders.user_id 
          FROM orders 
          WHERE orders.created_at >= :twoMonthsAgo 
          AND orders.deleted_at IS NULL
        )`,
        { twoMonthsAgo: formattedTwoMonthsAgo },
      );

    if (user_id) {
      queryBuilder.andWhere('user.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_is In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'user.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .orderBy('user.created_at', 'ASC')
      .getRawMany();

    const uniqueResults = result.reduce((acc, item) => {
      if (!acc.find((i) => i.user_id === item.user_id)) {
        acc.push(item);
      }
      return acc;
    }, []);

    return uniqueResults;
  }

  async getNewCustomerAcquisitionReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);
    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.created_at, '%b-%Y')", 'month')
      .addSelect('COUNT(user.user_id)', 'customer_count')
      .where('user.role_id = :customerRoleId', {
        customerRoleId: Role.CUSTOMER,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'user.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'user.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(user.created_at)', 'ASC')
      .getRawMany();

    result.map((c) => {
      c.customer_count = Number(c.customer_count);
    });

    return result;
  }

  async getCustomerActivityReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .leftJoin('user.loginHistories', 'loginHistories')
      .select("DATE_FORMAT(loginHistories.created_at, '%b-%Y')", 'month')
      .addSelect('COUNT(DISTINCT loginHistories.user_id)', 'login_count')
      .where('user.role_id =:roleId', { roleId: Role.CUSTOMER })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('loginHistories.user_id IS NOT NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'loginHistories.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'loginHistories.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(loginHistories.created_at)', 'ASC')
      .getRawMany();

    result.map((l) => {
      l.login_count = Number(l.login_count);
    });

    return result;
  }

  async getSalesBookingReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS month")
      .addSelect('COUNT(*) AS bookings_count')
      .addSelect('SUM(orders.total) AS total_sales')
      .addSelect('SUM(orders.paid_amount) AS total_collection')
      .addSelect('SUM(orders.total) - SUM(orders.paid_amount) AS unpaid_amount')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...orderStatus)', {
        orderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefundStatus', {
        excludeRefundStatus: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    result.map((b) => {
      b.bookings_count = Number(b.bookings_count);
      b.total_sales = Number(b.total_sales.toFixed(2));
      b.total_collection = Number(b.total_collection.toFixed(2));
      b.unpaid_amount = Number(b.unpaid_amount.toFixed(2));
    });

    return result;
  }

  async getFeedbackTrends(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate } = reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .select("DATE_FORMAT(feedback.created_at, '%b-%Y') AS month")
      .addSelect('feedback.rating', 'rating')
      .addSelect('COUNT(feedback.feedback_id)', 'count')
      .where('feedback.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'feedback.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('feedback.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .addGroupBy('feedback.rating')
      .orderBy('MIN(feedback.created_at)', 'ASC')
      .addOrderBy('feedback.rating', 'ASC')
      .getRawMany();

    this.convertCountToNumber(result);
    return result;
  }

  async getBranchWiseSalesAndCollectionsReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate, branch_id } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.branch', 'branch')
      .select('orders.branch_id', 'branch_id')
      .addSelect('branch.branch_name', 'branch_name')
      .addSelect('SUM(orders.total)', 'total_sales')
      .addSelect(
        'SUM(orders.total - orders.paid_amount - orders.kasar_amount)',
        'unpaid_amount',
      )
      .addSelect('SUM(orders.paid_amount)', 'total_collection')
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.branch_id IS NOT NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      })
      .groupBy('orders.branch_id')
      .addGroupBy('branch.branch_name')
      .addGroupBy('month')
      .addOrderBy('MIN(orders.created_at)', 'ASC')
      .addOrderBy('total_sales', 'ASC');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    if (branch_id) {
      queryBuilder = queryBuilder.andWhere('orders.branch_id =:branchId', {
        branchId: branch_id,
      });
    }

    const result = await queryBuilder.getRawMany();

    return result;
  }

  async getPaymentTransactionReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select('SUM(orders.total)', 'total_amount')
      .addSelect('SUM(orders.paid_amount)', 'total_transaction_amount')
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder.andWhere('orders.created_at >= NOW() - INTERVAL 6 MONTH');
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(orders.created_at)', 'ASC')
      .getRawMany();

    result.map((num) => {
      num.total_amount = Number(num.total_amount.toFixed(2));
      num.total_transaction_amount = Number(
        num.total_transaction_amount.toFixed(2),
      );
    });

    return result;
  }

  async getPaymentTransactionExcelReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate, user_id, company_id, branch_id } =
      reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        'customer.user_id AS customer_id',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.gst_company_name AS customer_company_name',
        'orders.total AS total_amount',

        `CASE orders.payment_status 
        WHEN 1 THEN 'Payment Pending'
        WHEN 2 THEN 'Full Payment Received'
        WHEN 3 THEN 'Partial Payment Received'
        END AS payment_status`,

        `CASE orders.payment_type
        WHEN 1 THEN 'Case On Delivery'
        WHEN 2 THEN 'Online Payment'
        END AS payment_type`,

        'orders.transaction_id AS transaction_id',
      ])
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.FULL_PAYMENT_RECEIVED,
      })

      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (user_id) {
      queryBuilder.andWhere('orders.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('company.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    return result;
  }

  async getGstExcelReport(reportFilterDto: ReportFilterDto): Promise<any> {
    const { startDate, endDate, user_id, company_id, branch_id } =
      reportFilterDto;
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.address_details AS address_details',
        'orders.gst_company_name AS customer_company_name',
        'orders.gstin AS customer_gstin',
      ])
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.payment_status = :paymentStatus', {
        paymentStatus: PaymentStatus.FULL_PAYMENT_RECEIVED,
      })

      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (user_id) {
      queryBuilder.andWhere('orders.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    return result;
  }

  async getPickupExcelReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<{ data: any[]; totals: any }> {
    const { startDate, endDate, user_id, company_id, branch_id, driver_id } =
      reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoinAndSelect('orders.pickup_boy', 'pickup_boy')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'DATE_FORMAT(orders.estimated_pickup_time, "%Y-%m-%d") AS pickup_date',
        "CONCAT(pickup_boy.first_name, ' ', pickup_boy.last_name) AS pickup_boy_name",
        'company.company_name AS company',
        'branch.branch_name AS branch',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.address_details AS address_details',
        'orders.gst_company_name AS customer_company_name',
        'orders.gstin AS customer_gstin',
        'orders.total AS total_amount',
        'orders.paid_amount AS paid_amount',
        '(orders.total - orders.paid_amount - IFNULL(orders.kasar_amount, 0)) AS pending_amount',
        'orders.delivery_collect_amount AS delivery_collect_amount',
        'orders.kasar_amount AS kasar_amount',
        `CASE orders.payment_status 
        WHEN 1 THEN 'Payment Pending'
        WHEN 2 THEN 'Full Payment Received'
        WHEN 3 THEN 'Partial Payment Received'
        END AS payment_status`,
      ])
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.pickup_boy_id IS NOT NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (user_id) {
      queryBuilder.andWhere('orders.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (driver_id) {
      queryBuilder.andWhere('orders.pickup_boy_id In (:...driverId)', {
        driverId: driver_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    const totals = {
      total_orders: result.length,
      total_amount: 0,
      paid_amount: 0,
      kasar_amount: 0,
      pending_amount: 0,
    };

    result.forEach((item) => {
      totals.total_amount += Number(item.total_amount || 0);
      totals.paid_amount += Number(item.paid_amount || 0);
      totals.kasar_amount += Number(item.kasar_amount || 0);
      totals.pending_amount += Number(item.pending_amount || 0);
    });

    return { data: result, totals };
  }

  async getDeliveryExcelReport(
    reportFilterDto: ReportFilterDto,
  ): Promise<{ data: any[]; totals: any }> {
    const { startDate, endDate, user_id, company_id, branch_id, driver_id } =
      reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.user', 'customer')
      .leftJoin('orders.delivery_boy', 'deliveryBoy')
      .leftJoinAndSelect('orders.branch', 'branch')
      .leftJoinAndSelect('orders.company', 'company')
      .select([
        'orders.order_id AS order_id',
        'DATE_FORMAT(orders.estimated_delivery_time, "%Y-%m-%d") AS delivery_date',
        'company.company_name AS company',
        'branch.branch_name AS branch',
        "CONCAT(customer.first_name, ' ', customer.last_name) AS customer_name",
        'orders.address_details AS address_details',
        'orders.gst_company_name AS customer_company_name',
        'orders.gstin AS customer_gstin',
        'orders.total AS total_amount',
        'orders.paid_amount AS paid_amount',
        '(orders.total - orders.paid_amount - IFNULL(orders.kasar_amount, 0)) AS pending_amount',
        'orders.delivery_collect_amount AS delivery_collect_amount',
        'orders.kasar_amount AS kasar_amount',
        `CASE orders.payment_status 
        WHEN 1 THEN 'Payment Pending'
        WHEN 2 THEN 'Full Payment Received'
        WHEN 3 THEN 'Partial Payment Received'
        END AS payment_status`,
      ])
      .addSelect(
        "CONCAT(deliveryBoy.first_name, ' ', deliveryBoy.last_name) AS delivery_boy_name",
      )
      .addSelect(`DATE_FORMAT(orders.created_at, '%b-%Y')`, 'month')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.delivery_boy_id IS NOT NULL')
      .andWhere('orders.order_status NOT IN (:...excludeOrderStatus)', {
        excludeOrderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })

      .andWhere('orders.refund_status != :refundStatus', {
        refundStatus: RefundStatus.FULL,
      });

    if (user_id) {
      queryBuilder.andWhere('orders.user_id In (:...userId)', {
        userId: user_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyId)', {
        companyId: company_id,
      });
    }
    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (driver_id) {
      queryBuilder.andWhere('orders.delivery_boy_id In (:...driverId)', {
        driverId: driver_id,
      });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    } else {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at >= NOW() - INTERVAL 6 MONTH',
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    const totals = {
      total_orders: result.length,
      total_amount: 0,
      paid_amount: 0,
      kasar_amount: 0,
      pending_amount: 0,
      delivery_collect_amount: 0,
    };

    result.forEach((item) => {
      totals.total_amount += Number(item.total_amount || 0);
      totals.paid_amount += Number(item.paid_amount || 0);
      totals.kasar_amount += Number(item.kasar_amount || 0);
      totals.pending_amount += Number(item.pending_amount || 0);
      totals.delivery_collect_amount += Number(
        item.delivery_collect_amount || 0,
      );
    });

    return { data: result, totals };
  }

  async getBranchWiseOrderSummary(
    user?: any,
    reportFilterDto?: ReportFilterDto,
  ): Promise<any> {
    const { startDate, endDate } = reportFilterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const queryBuider = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.branch', 'branch')
      .select('branch.branch_id', 'branch_id')
      .addSelect('branch.branch_name', 'branch_name')
      .addSelect('COUNT(orders.order_id)', 'order_count')
      .addSelect('SUM(orders.total)', 'total_amount')
      .addSelect(
        `SUM(CASE WHEN orders.order_status = :status THEN orders.delivery_collect_amount ELSE 0 END)`,
        'delivery_amounts',
      )
      .addSelect(
        `SUM(CASE WHEN orders.order_status = :status THEN 1 ELSE 0 END)`,
        'delivery_count',
      )
      .setParameter('status', OrderStatus.DELIVERED)
      .where('orders.deleted_at IS NULL')
      .andWhere('branch.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...orderStatus)', {
        orderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('orders.refund_status != :excludeRefund', {
        excludeRefund: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuider.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const userData = (await this.userService.getUserBranches(user.user_id))
      .data;

    const branch_ids = userData.user.branch_ids;

    if (user.role_id === Role.BRANCH_MANAGER) {
      queryBuider.andWhere('branch.branch_id IN(:branchIds)', {
        branchIds: branch_ids,
      });
    }

    const result = await queryBuider
      .groupBy('branch.branch_id')
      .addGroupBy('branch.branch_name')
      .getRawMany();

    result.map((b) => {
      b.order_count = Number(b.order_count);
      b.delivery_count = Number(b.delivery_count);
    });

    return result;
  }

  async getServiceWiseReport(dto: ReportFilterDto): Promise<any> {
    const { startDate, endDate, branch_id, service_id } = dto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      convertDateParameters(startDate, endDate);

    const query = this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.branch', 'branch')
      .innerJoin('order.items', 'item')
      .innerJoin('item.service', 'service')
      .select([
        'branch.branch_name AS branch',
        'service.name AS service',
        'SUM(item.quantity) AS total_quantity',
        'SUM(order.total) AS total_amount',
        'SUM(order.paid_amount) AS paid_amount',
        '(SUM(order.total) - SUM(order.paid_amount) - SUM(order.kasar_amount)) AS pending_amount',
      ])
      .where('order.deleted_at IS NULL')
      .andWhere('branch.deleted_at IS NULL')
      .andWhere('order.order_status NOT IN (:...orderStatus)', {
        orderStatus: [
          OrderStatus.CANCELLED_BY_ADMIN,
          OrderStatus.CANCELLED_BY_CUSTOMER,
        ],
      })
      .andWhere('order.refund_status != :excludeRefund', {
        excludeRefund: RefundStatus.FULL,
      });

    if (formattedStartDate && formattedEndDate) {
      query.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    }

    if (branch_id) {
      query.andWhere('branch.branch_id In (:...branchId)', {
        branchId: branch_id,
      });
    }

    if (service_id) {
      query.andWhere('service.service_id  In (:...serviceId)', {
        serviceId: service_id,
      });
    }

    query.groupBy('branch.branch_name, service.name');
    query.orderBy('branch.branch_name');

    return await query.getRawMany();
  }
}
