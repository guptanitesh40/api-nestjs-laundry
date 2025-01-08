import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'razorpay' })
export class Razorpay extends BaseEntity {
  @PrimaryGeneratedColumn()
  razorpay_id: number;

  @Column({ nullable: true })
  razorpay_order_id: string;
}
