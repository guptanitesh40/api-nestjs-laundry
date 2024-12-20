import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsPublish } from 'src/enum/is_publish.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity({ name: 'feedback' })
@Unique(['order_id'])
export class Feedback extends BaseEntity {
  @PrimaryGeneratedColumn()
  feedback_id: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  rating: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  comment?: string;

  @Column({ type: 'int', default: IsPublish.NONE })
  @IsOptional()
  is_publish?: IsPublish;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  order_id: number;
}
