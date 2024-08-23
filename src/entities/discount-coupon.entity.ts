import { CouponType, DiscountType } from 'src/enum/coupon_type.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'discount_coupons' })
export class DiscountCoupon extends BaseEntity {
  @PrimaryGeneratedColumn()
  coupon_id: number;

  @Column({ type: 'varchar', length: 255 })
  coupon_code: string;

  @Column({ type: 'text', nullable: true })
  coupon_description: string;

  @Column({ type: 'varchar', length: 255 })
  coupon_title: string;

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

  @Column({ type: 'int', nullable: true })
  coupon_type: CouponType;
}