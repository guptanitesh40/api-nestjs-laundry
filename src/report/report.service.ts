import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from 'src/entities/order.entity';
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
}
