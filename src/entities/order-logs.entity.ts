import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity({ name: 'order_logs' })
export class OrderLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  order_log_id: number;

  @Column()
  user_id: number;

  @Column()
  order_id: number;

  @Column()
  type: string;

  @ManyToOne(() => User, (user) => user.orderLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
