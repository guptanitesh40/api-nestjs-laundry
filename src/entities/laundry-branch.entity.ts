import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('laundry-branches')
export class LaundryBranch extends BaseEntity {
  @PrimaryGeneratedColumn()
  laundry_branch_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone_number1: string;

  @Column({ nullable: true })
  phone_number2: string;

  @Column({ nullable: true })
  lat: string;

  @Column({ nullable: true })
  long: string;
}
