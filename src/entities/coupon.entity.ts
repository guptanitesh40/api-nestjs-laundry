import { CouponType, DiscountType } from 'src/enum/coupon_type.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'coupons' })
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  coupon_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'int' })
  total_usage_count: number;

  @Column({ type: 'int' })
  maximum_usage_count_per_user: number;

  @Column({ type: 'int', nullable: true })
  discount_type: DiscountType;

  @Column({ type: 'float', nullable: false })
  discount_value: number;

  @Column({ type: 'int', nullable: true })
  coupon_type: CouponType;

  @Column({ type: 'int', nullable: true })
  min_cart_value: number;
}
