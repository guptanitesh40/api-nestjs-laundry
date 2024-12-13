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
import { Product } from './product.entity';
import { Service } from './service.entity';
import { User } from './user.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  cart_id: number;

  @Column()
  category_id: number;

  @Column()
  product_id: number;

  @Column()
  service_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.carts, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.carts, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Service, (service) => service.carts, { nullable: false })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Category, (category) => category.carts, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  description?: string;
}
