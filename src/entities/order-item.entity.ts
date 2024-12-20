import { IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { Service } from './service.entity';

@Entity({ name: 'order_items' })
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  item_id: number;

  @Column()
  category_id: number;

  @Column()
  product_id: number;

  @Column()
  service_id: number;

  @Column()
  order_id: number;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  description?: string;

  @ManyToOne(() => Order, (orderDetail) => orderDetail.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'int', default: 1 })
  @IsOptional()
  quantity?: number;
}
