import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'razorpay_transactions' })
export class RazorpayTransactions extends BaseEntity {
  @PrimaryGeneratedColumn()
  razorpay_transaction_id: number;

  @Column({ nullable: true })
  razorpay_order_id: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  razorpay_payment_link_id?: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  amount: number;

  @ManyToOne(() => User, (user) => user.userBranchMappings, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: number;
}
