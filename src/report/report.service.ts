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

  async getTotalOrderReport(): Promise<{ day: string; count: number }[]> {
    const result = await this.orderRepository
      .createQueryBuilder('orders')
      .select("DATE_FORMAT(orders.created_at, '%b-%Y') AS day")
      .addSelect('COUNT(*) AS count')
      .where('orders.created_at >= NOW() - INTERVAL 6 MONTH')
      .andWhere('orders.deleted_at IS NULL')
      .groupBy('day')
      .orderBy('day', 'DESC')
      .getRawMany();

    return result.map((row: { day: string; count: string }) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }
}
