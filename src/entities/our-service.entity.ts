import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'our_services' })
export class OurService extends BaseEntity {
  @PrimaryGeneratedColumn()
  our_service_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  note: string;
}
