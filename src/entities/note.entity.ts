import { IsOptional, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderDetail } from './order.entity';
import { User } from './user.entity';

@Entity({ name: 'notes' })
export class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  note_id: number;

  @ManyToOne(() => OrderDetail, (orderDetail) => orderDetail.notes)
  @JoinColumn({ name: 'order_id' })
  order: OrderDetail;

  @Column()
  order_id: number;

  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  text_note: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;
}
