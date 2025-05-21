import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_hindi: string;

  @Column({ nullable: true })
  name_gujarati: string;

  @OneToMany(() => Cart, (carts) => carts.category)
  carts: Cart[];
}
