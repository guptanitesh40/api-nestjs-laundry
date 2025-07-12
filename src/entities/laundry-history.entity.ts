import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('laundry_histories')
export class LaundryHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  laundry_history_id: number;

  @Column()
  year: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  image: string;
}
