import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'our_prices' })
export class OurPrice extends BaseEntity {
  @PrimaryGeneratedColumn()
  our_price_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;
}
