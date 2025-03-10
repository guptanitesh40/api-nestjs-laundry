import { IsOptional } from 'class-validator';
import { AddressType } from 'src/enum/address_type.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'user_addresses' })
export class UserAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  address_id: number;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  address_type?: AddressType;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  building_number: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @Column({ nullable: true })
  pincode: number;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;
}
