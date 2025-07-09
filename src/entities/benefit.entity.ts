import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'benefits' })
export class Benefit extends BaseEntity {
  @PrimaryGeneratedColumn()
  benefit_id: number;

  @Column()
  title: string;

  @Column()
  image: string;
}
