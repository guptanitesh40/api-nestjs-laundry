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
    const result = await this.orderRepository.query(`
      SELECT DATE_FORMAT(created_at, '%b-%Y') AS day, COUNT(*) AS count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL 6 MONTH AND deleted_at IS NULL
      GROUP BY day
      ORDER BY day DESC;
    `);

    return result.map((row: { day: string; count: string }) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }
}
