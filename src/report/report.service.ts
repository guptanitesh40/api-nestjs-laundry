import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from 'src/entities/feedback.entity';
import { Order } from 'src/entities/order.entity';
import { RazorpayTransactions } from 'src/entities/razorpay.entity';
import { User } from 'src/entities/user.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { Role } from 'src/enum/role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(RazorpayTransactions)
    private readonly razorpayRepository: Repository<RazorpayTransactions>,
  ) {}

  private formattedDateToSQL(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }

  private convertDateParameters(
    startDate?: string,
    endDate?: string,
  ): { startDate: Date | undefined; endDate: Date | undefined } {
    return {
      startDate: startDate
        ? new Date(this.formattedDateToSQL(startDate))
        : undefined,
      endDate: endDate ? new Date(this.formattedDateToSQL(endDate)) : undefined,
    };
  }

  private convertCountToNumber(arr) {
    return arr.map((c) => {
      c.count = Number(c.count);
      return c;
    });
  }

  async getTotalOrderReport(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS month")
      .addSelect('COUNT(*) AS count')
      .addSelect('SUM(orders.total) AS total_amount')
      .addSelect(
        'SUM(orders.total - orders.paid_amount - orders.kasar_amount - orders.refund_amount) AS pending_amount',
      )
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

    this.convertCountToNumber(result);

    result.map((r) => {
      r.total_amount = Number(r.total_amount.toFixed(2));
      r.pending_amount = Number(r.pending_amount.toFixed(2));
    });

    return result;
  }

  async getDeliveryCompletedReport(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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

  async getDeliveryReport(startDate?: string, endDate?: string): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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

  async getPaymentReport(startDate?: string, endDate?: string): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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

  async getPendingAmountReport(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formatedEndDate } =
      this.convertDateParameters(startDate, endDate);
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

  async getRefundReport(startDate?: string, endDate?: string): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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

  async getKasarReport(startDate?: string, endDate?: string): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const formattedTwoMonthsAgo = twoMonthsAgo.toISOString().split('T')[0];

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .leftJoin('user.orders', 'orders')
      .select("DATE_FORMAT(user.created_at, '%b-%Y') AS month")
      .addSelect('COUNT(*) AS not_active_count')
      .where('user.role_id = :customerRoleId', {
        customerRoleId: Role.CUSTOMER,
      })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .andWhere(
        `user.user_id NOT IN (SELECT DISTINCT orders.user_id FROM orders WHERE orders.created_at >= :twoMonthsAgo)`,
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

    result.map((c) => {
      c.not_active_count = Number(c.not_active_count);
    });

    return result;
  }

  async getNewCustomerAcquisitionReport(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);
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
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .leftJoin('user.loginHistories', 'loginHistories')
      .select("DATE_FORMAT(loginHistories.created_at, '%b-%Y')", 'month')
      .addSelect('COUNT(loginHistories.user_id)', 'login_count')
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

  async getSalesBookingReport(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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
      .andWhere('orders.refund_status != refundStatus', {
        refundStatus: RefundStatus.FULL,
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

  async getFeedbackTrends(startDate?: string, endDate?: string): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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
    startDate?: string,
    endDate?: string,
    branch_id?: number,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

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
      .orderBy('total_sales', 'ASC');

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
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.razorpayRepository
      .createQueryBuilder('razorpay')
      .select("DATE_FORMAT(razorpay.created_at, '%b-%Y') AS month")
      .addSelect('SUM(razorpay.amount) AS total_amount')
      .addSelect(
        "COUNT(CASE WHEN razorpay.status = 'created' THEN 1 END) AS created_count",
      )
      .addSelect(
        "COUNT(CASE WHEN razorpay.status = 'paid' THEN 1 END) AS paid_count",
      )
      .addSelect(
        "COUNT(CASE WHEN razorpay.status = 'attempted' THEN 1 END) AS attempted_count",
      )
      .where('razorpay.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'razorpay.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .orderBy('MIN(razorpay.created_at)', 'ASC')
      .getRawMany();

    result.map((num) => {
      num.total_amount = Number(num.total_amount);
      num.created_count = Number(num.created_count);
      num.paid_count = Number(num.paid_count);
      num.attempted_count = Number(num.attempted_count);
    });

    return result;
  }
}
