import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_hindi: string;

  @Column({ nullable: true })
  name_gujarati: string;

  @Column()
  image: string;

  @OneToMany(() => Cart, (cart) => cart.product)
  carts: Cart[];
}
