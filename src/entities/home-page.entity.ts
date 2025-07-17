import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'home-page' })
export class HomePage extends BaseEntity {
  @PrimaryGeneratedColumn()
  home_page_id: number;

  @Column()
  key: string;

  @Column()
  value: string;
}
