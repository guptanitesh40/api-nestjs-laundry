import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('labels')
export class Label extends BaseEntity {
  @PrimaryGeneratedColumn()
  label_id: number;

  @Column()
  label_name: string;
}
