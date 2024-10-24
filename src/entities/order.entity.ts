import { IsOptional } from 'class-validator';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';
import { RefundStatus } from 'src/enum/refund_status.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAddress } from './address.entity';
import { BaseEntity } from './base.entity';
import { Feedback } from './feedback.entity';
import { Note } from './note.entity';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity({ name: 'orders' })
export class OrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  coupon_code: string;

  @Column({ nullable: true })
  @IsOptional()
  express_delivery_charges?: number;

  @Column({ type: 'float' })
  sub_total: number;

  @Column({ type: 'float', nullable: true })
  coupon_discount?: number;

  @Column({ type: 'float' })
  shipping_charges: number;

  @Column({ type: 'float' })
  total: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ManyToOne(() => UserAddress)
  @JoinColumn({ name: 'address_id' })
  address: UserAddress;

  @Column()
  address_id: number;

  @Column({ type: 'varchar', length: 255 })
  address_details: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  transaction_id?: string;

  @Column({ type: 'float', nullable: true })
  kasar_amount?: number;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  paid_amount?: number;

  @Column({ type: 'int', default: PaymentType.ONLINE_PAYMENT })
  payment_type: PaymentType;

  @Column({ type: 'int', default: OrderStatus.PENDING })
  order_status: OrderStatus;

  @Column({
    type: 'int',
    default: PaymentStatus.PAYMENT_PENDING,
  })
  payment_status: PaymentStatus;

  @OneToMany(() => Note, (note) => note.order)
  notes: Note[];

  @OneToOne(() => Feedback, (feedback) => feedback.order)
  feedback: Feedback;

  @ManyToOne(() => User, (user) => user.ordersAsDeliveryBoy)
  @JoinColumn({ name: 'delivery_boy_id' })
  delivery_boy: User;

  @Column({ nullable: true })
  delivery_boy_id: number;

  @Column({ type: 'date', nullable: true })
  estimated_delivery_time: Date;

  @Column({ nullable: true })
  @IsOptional()
  created_by_user_id?: number;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  estimated_pickup_time?: Date;

  @Column('float', { nullable: true })
  gst: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  refund_amount: number;

  @Column({ type: 'int', default: RefundStatus.NONE })
  refund_status: RefundStatus;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  refund_descriptions?: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  pickup_comment?: string;
}
