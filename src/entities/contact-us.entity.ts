import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('contact_us')
export class ContactUs extends BaseEntity {
  @PrimaryGeneratedColumn()
  contact_us_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  message?: string;
}
