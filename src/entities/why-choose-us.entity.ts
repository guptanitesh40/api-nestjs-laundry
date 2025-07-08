import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class WhyChooseUs extends BaseEntity {
  @PrimaryGeneratedColumn()
  why_choose_us_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;
}
