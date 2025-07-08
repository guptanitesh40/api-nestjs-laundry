import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('service-lists')
export class ServiceList extends BaseEntity {
  @PrimaryGeneratedColumn()
  service_list_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  image: string;
}
