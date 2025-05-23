import { IsOptional } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';

@Entity({ name: 'services' })
export class Service extends BaseEntity {
  @PrimaryGeneratedColumn()
  service_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_hindi: string;

  @Column({ nullable: true })
  name_gujarati: string;

  @Column()
  image: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column({ default: true })
  @IsOptional()
  is_visible?: boolean;

  @OneToMany(() => Cart, (cart) => cart.service)
  carts: Cart[];
}
