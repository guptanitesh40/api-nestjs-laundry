import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderLog } from 'src/entities/order-logs.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class OrderLogService {
  constructor(
    @InjectRepository(OrderLog)
    private readonly orderLogRepository: Repository<OrderLog>,
  ) {}

  async create(user_id: number, order_id: number, type: string): Promise<any> {
    const log = this.orderLogRepository.create({
      user_id,
      order_id,
      type,
    });

    return await this.orderLogRepository.save(log);
  }

  async getAll(orderIds: number[]): Promise<OrderLog[]> {
    return this.orderLogRepository.find({
      where: { order_id: In(orderIds) },
      relations: ['user'],
      select: {
        user_id: true,
        order_id: true,
        type: true,
        user: {
          user_id: true,
          first_name: true,
          last_name: true,
          email: true,
          mobile_number: true,
        },
      },
    });
  }
}
