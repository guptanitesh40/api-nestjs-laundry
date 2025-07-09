import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('laundry-services')
export class LaundryService extends BaseEntity {
  @PrimaryGeneratedColumn()
  laundry_service_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  image: string;
}
