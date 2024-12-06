import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Feedback } from 'src/entities/feedback.entity';
import { OrderDetail } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { Role } from 'src/enum/role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderRepository: Repository<OrderDetail>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
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

  async getTotalOrderReport(
    startDate?: string,
    endDate?: string,
  ): Promise<
    { day: string; count: number; totalAmount: number; pendingAmount: number }[]
  > {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS day")
      .addSelect('COUNT(*) AS count')
      .addSelect('SUM(orders.total) AS totalAmount')
      .addSelect('SUM(orders.total - orders.paid_amount) AS pendingAmount')
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
      .groupBy('day')
      .orderBy('day', 'DESC')
      .getRawMany();

    return result.map(
      (row: {
        day: string;
        count: string;
        totalAmount: string;
        pendingAmount: string;
      }) => ({
        day: row.day,
        count: Number(row.count),
        totalAmount: Number(row.totalAmount),
        pendingAmount: Number(row.pendingAmount),
      }),
    );
  }

  async getDeliveryCompletedReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; status: string; count: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at,'%y-%b') AS month")
      .addSelect(
        `CASE WHEN orders.order_status = ${OrderStatus.DELIVERY_BOY_MARKS_AS_COMPLETED} THEN 'Completed' ELSE 'Pending' END`,
        'status',
      )
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERY_BOY_MARKS_AS_COMPLETED],
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
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(
      (row: { month: string; status: string; count: string }) => ({
        month: row.month,
        status: row.status,
        count: Number(row.count),
      }),
    );
  }

  async getDeliveryPendingReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; status: string; count: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at,'%y-%b') AS month")
      .addSelect(`'Pending' AS status`)
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status NOT IN (:...completedStatuses)', {
        completedStatuses: [
          OrderStatus.DELIVERY_BOY_MARKS_AS_COMPLETED,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED,
          OrderStatus.RETURNED,
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
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(
      (row: { month: string; status: string; count: string }) => ({
        month: row.month,
        status: row.status,
        count: Number(row.count),
      }),
    );
  }

  async getPaymentReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ paymentType: string; count: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(
        `CASE WHEN orders.payment_type = ${PaymentType.CASH_ON_DELIVERY} THEN 'Cash on Delivery' ELSE 'Online Payment' END`,
        'paymentType',
      )
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy('paymentType')
      .orderBy('paymentType', 'ASC')
      .getRawMany();

    return result.map((row: { paymentType: string; count: string }) => ({
      paymentType: row.paymentType,
      count: Number(row.count),
    }));
  }

  async getPendingAmountReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; paymentType: string; pendingAmount: number }[]> {
    const { startDate: formattedStartDate, endDate: formatedEndDate } =
      this.convertDateParameters(startDate, endDate);
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at, '%Y-%b')`, 'month')
      .addSelect(
        `CASE WHEN orders.payment_type = ${PaymentType.CASH_ON_DELIVERY} THEN 'Cash on Delivery' ELSE 'Online Payment' END`,
        'paymentType',
      )
      .addSelect(
        `SUM(
          CASE 
            WHEN orders.payment_status = ${PaymentStatus.PAYMENT_PENDING} THEN orders.total - COALESCE(orders.paid_amount, 0) - COALESCE(orders.refund_amount, 0)
            WHEN orders.payment_status = ${PaymentStatus.PARTIAL_PAYMENT_RECEIVED} THEN orders.total - COALESCE(orders.paid_amount, 0)
            ELSE 0
          END
        )`,
        'pendingAmount',
      )
      .where('orders.deleted_at IS NULL')
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
    }

    const result = await queryBuilder
      .groupBy('month, paymentType')
      .orderBy('month', 'ASC')
      .addOrderBy('paymentType', 'ASC')
      .getRawMany();

    return result.map(
      (row: { month: string; paymentType: string; pendingAmount: string }) => ({
        month: row.month,
        paymentType: row.paymentType,
        pendingAmount: Number(row.pendingAmount),
      }),
    );
  }

  async getRefundReport(
    startDate?: string,
    endDate?: string,
  ): Promise<
    { orderId: number; refundAmount: number; refundStatus: string }[]
  > {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at,'%y-%b')`, 'month')
      .addSelect('orders.order_id', 'orderId')
      .addSelect('orders.refund_amount', 'refundAmount')
      .addSelect('orders.total', 'orderTotal')
      .addSelect(
        `CASE 
          WHEN orders.refund_status = ${RefundStatus.FULL} THEN 'Full'
          WHEN orders.refund_status = ${RefundStatus.PARTIAL} THEN 'Partial'
          ELSE 'None'
        END`,
        'refundStatus',
      )
      .where('orders.refund_amount IS NOT NULL')
      .andWhere('orders.refund_amount > 0');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .orderBy('orders.created_at', 'ASC')
      .getRawMany();

    return result.map(
      (row: {
        month: string;
        orderId: number;
        orderTotal: number;
        refundAmount: number;
        refundStatus: string;
      }) => ({
        month: row.month,
        orderId: row.orderId,
        orderTotal: row.orderTotal,
        refundAmount: Number(row.refundAmount),
        refundStatus: row.refundStatus,
      }),
    );
  }

  async getKasarReport(
    startDate?: string,
    endDate?: string,
  ): Promise<
    { month: string; totalKasarAmount: number; totalOrderAmount: number }[]
  > {
    const { startDate: formattedStartDate, endDate: formatedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%Y-%b')", 'month')
      .addSelect('SUM(orders.kasar_amount)', 'totalKasarAmount')
      .addSelect('SUM(orders.total)', 'totalOrderAmount')
      .where('orders.kasar_amount IS NOT NULL')
      .andWhere('orders.kasar_amount > 0');

    if (formattedStartDate && formatedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formatedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy("DATE_FORMAT(orders.created_at, '%Y-%b')")
      .orderBy("DATE_FORMAT(orders.created_at, '%Y-%b')", 'ASC')
      .getRawMany();

    return result.map(
      (row: {
        month: string;
        totalKasarAmount: string;
        totalOrderAmount: string;
      }) => ({
        month: row.month,
        totalKasarAmount: Number(row.totalKasarAmount),
        totalOrderAmount: Number(row.totalOrderAmount),
      }),
    );
  }

  async getNotActiveCustomerReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; notActiveCount: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    const twoMonthsAgo = (() => {
      const date = new Date(new Date().setMonth(new Date().getMonth() - 2));
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();

    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.created_at, '%Y-%m-%d') AS month")
      .addSelect('COUNT(*) AS notActiveCount')
      .where('user.deleted_at IS NULL')
      .andWhere(
        `user.user_id NOT IN (SELECT DISTINCT orders.user_id FROM orders WHERE orders.created_at >= :twoMonthsAgo)`,
        { twoMonthsAgo },
      );

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
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map((row: { month: string; notActiveCount: string }) => ({
      month: row.month,
      notActiveCount: Number(row.notActiveCount),
    }));
  }

  async getNewCustomerAcquisitionReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ customerId: number; registrationDate: Date }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);
    let queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.created_at, '%y-%m')", 'month')
      .addSelect('COUNT(user.user_id)', 'customerCount')
      .where('user.role_id = :customerRoleId', {
        customerRoleId: Role.CUSTOMER,
      });

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'user.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy("DATE_FORMAT(user.created_at,'%y-%m')")
      .orderBy("DATE_FORMAT(user.created_at,'%y-%m')", 'ASC')
      .getRawMany();
    return result;
  }

  async getCustomerActivityReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; loginCount: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    const queryBuilder = this.userRespository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(loginHistory.created_at, '%Y-%b')", 'month')
      .addSelect('COUNT(DISTINCT loginHistory.user_id)', 'loginCount')
      .leftJoin(
        'user.loginHistories',
        'loginHistory',
        'loginHistory.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      )
      .where('user.deleted_at IS NULL')
      .andWhere('loginHistory.user_id IS NOT NULL')
      .groupBy('month')
      .orderBy('month', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((row: { month: string; loginCount: string }) => ({
      month: row.month,
      loginCount: Number(row.loginCount),
    }));
  }

  async getSalesBookingReport(
    startDate?: string,
    endDate?: string,
  ): Promise<
    { day: string; bookingsCount: number; totalSalesAmount: number }[]
  > {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS day")
      .addSelect('COUNT(*) AS bookingsCount')
      .addSelect('SUM(orders.total) AS totalSalesAmount')
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
      .groupBy('day')
      .orderBy('day', 'DESC')
      .getRawMany();

    return result.map(
      (row: {
        day: string;
        bookingsCount: string;
        totalSalesAmount: string;
      }) => ({
        day: row.day,
        bookingsCount: Number(row.bookingsCount),
        totalSalesAmount: Number(row.totalSalesAmount),
      }),
    );
  }

  async getFeedbackTrends(
    startDate?: string,
    endDate?: string,
  ): Promise<{ month: string; rating: number; count: number }[]> {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .select("DATE_FORMAT(feedback.created_at, '%Y-%b') AS month")
      .addSelect('feedback.rating', 'rating')
      .addSelect('COUNT(feedback.feedback_id)', 'count')
      .where('feedback.deleted_at IS NULL');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'feedback.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder
      .groupBy('month')
      .addGroupBy('feedback.rating')
      .orderBy('month', 'ASC')
      .addOrderBy('feedback.rating', 'ASC')
      .getRawMany();

    return result.map(
      (row: { month: string; rating: string; count: string }) => ({
        month: row.month,
        rating: Number(row.rating),
        count: Number(row.count),
      }),
    );
  }

  async getBranchWiseSalesAndCollectionsReport(
    startDate?: string,
    endDate?: string,
  ): Promise<
    {
      branchID: string;
      branchName: string;
      totalSales: number;
      totalCollection: number;
    }[]
  > {
    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(startDate, endDate);

    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .innerJoin('orders.branch', 'branch')
      .select('orders.branch_id', 'branchId')
      .addSelect('branch.branch_name', 'branchName')
      .addSelect('SUM(orders.total)', 'totalSales')
      .addSelect('SUM(orders.paid_amount)', 'totalCollection')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.branch_id IS NOT NULL')
      .groupBy('orders.branch_id')
      .addGroupBy('branch.branch_name')
      .orderBy('totalSales', 'DESC');

    if (formattedStartDate && formattedEndDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate: formattedStartDate, endDate: formattedEndDate },
      );
    }

    const result = await queryBuilder.getRawMany();

    return result;
  }

  async getSalesReport(filterDto: {
    company_id?: number;
    branch_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Response> {
    const { company_id, branch_id, start_date, end_date } = filterDto;

    const { startDate: formattedStartDate, endDate: formattedEndDate } =
      this.convertDateParameters(start_date, end_date);

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('branch.company', 'company')
      .select([
        'branch.branch_name AS branch_name',
        'company.company_name AS company_name',
        "DATE_FORMAT(order.created_at, '%Y-%m') AS month",
        'SUM(order.total) AS total_sales',
        'SUM(order.paid_amount) AS total_collection',
        '(SUM(order.total) - SUM(order.paid_amount)) AS unpaid_Amount',
      ])
      .groupBy('branch.branch_id, company.company_id, month')
      .orderBy('company.company_name', 'ASC')
      .addOrderBy('branch.branch_name', 'ASC')
      .addOrderBy('month', 'ASC');

    if (company_id) {
      queryBuilder.andWhere('company.company_id = :company_id', { company_id });
    }

    if (branch_id) {
      queryBuilder.andWhere('branch.branch_id = :branch_id', { branch_id });
    }

    if (formattedStartDate && formattedEndDate) {
      queryBuilder.andWhere(
        'order.created_at BETWEEN :start_date AND :end_date',
        {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
      );
    }

    const report = await queryBuilder.getRawMany();

    return {
      statusCode: 200,
      message: 'Sales report fetched successfully',
      data: report,
    };
  }
}
