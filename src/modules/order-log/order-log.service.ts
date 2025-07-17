import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderLog } from 'src/entities/order-logs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderLogService {
  constructor(
    @InjectRepository(OrderLog)
    private readonly orderLogRepository: Repository<OrderLog>,
  ) {}

  async create(
    user_id: number,
    order_id: number,
    type: string,
  ): Promise<OrderLog> {
    const log = this.orderLogRepository.create({
      user_id,
      order_id,
      type,
    });

    return await this.orderLogRepository.save(log);
  }
}
