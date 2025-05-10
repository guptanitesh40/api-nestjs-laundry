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

  @Column()
  image: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @OneToMany(() => Cart, (cart) => cart.service)
  carts: Cart[];
}
