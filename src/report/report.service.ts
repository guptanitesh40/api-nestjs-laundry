import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from 'src/entities/order.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderRepository: Repository<OrderDetail>,
  ) {}

  async getTotalOrderReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ day: string; count: number }[]> {
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS day")
      .addSelect('COUNT(*) AS count')
      .where('orders.deleted_at IS NULL');

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
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

    return result.map((row: { day: string; count: string }) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }

  async getDeliveryStatusReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ status: string; count: number }[]> {
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(
        `CASE WHEN orders.order_status = ${OrderStatus.PENDING} THEN 'Pending' ELSE 'Completed' END`,
        'status',
      )
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL')
      .andWhere('orders.order_status IN (:...statuses)', {
        statuses: [OrderStatus.PENDING, OrderStatus.DELIVERY_COMPLETE],
      });

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const result = await queryBuilder
      .groupBy('status')
      .orderBy('status', 'ASC')
      .getRawMany();

    return result.map((row: { status: string; count: string }) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  async getPaymentReport(
    startDate?: string,
    endDate?: string,
  ): Promise<{ paymentType: string; count: number }[]> {
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(
        `CASE WHEN orders.payment_type = ${PaymentType.CASH_ON_DELIVERY} THEN 'Cash on Delivery' ELSE 'Online Payment' END`,
        'paymentType',
      )
      .addSelect('COUNT(*)', 'count')
      .where('orders.deleted_at IS NULL');

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
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
    let queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select(`DATE_FORMAT(orders.created_at, '%Y-%m-%d')`, 'month')
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

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        'orders.created_at BETWEEN :startDate AND :endDate',
        { startDate, endDate },
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
}
