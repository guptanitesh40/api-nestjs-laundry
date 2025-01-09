import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsPublish } from 'src/enum/is_publish.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

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

  @ManyToOne(() => User, (user) => user.feedback, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: number;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  order_id: number;
}
