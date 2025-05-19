import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('label_management')
export class LabelManagement extends BaseEntity {
  @PrimaryGeneratedColumn()
  label_management_id: number;

  @Column()
  label_name: string;
}
