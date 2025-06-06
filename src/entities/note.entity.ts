import { IsOptional, IsString } from 'class-validator';
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

@Entity({ name: 'notes' })
export class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  note_id: number;

  @ManyToOne(() => Order, (orderDetail) => orderDetail.notes)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  order_id: number;

  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ type: 'text', nullable: true })
  text_note: string;

  @Column({ nullable: true, default: false })
  is_visible: boolean;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
