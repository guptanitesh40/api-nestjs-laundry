import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('languages')
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn()
  language_id: number;

  @Column()
  language_name: string;

  @Column()
  language_code: string;
}
