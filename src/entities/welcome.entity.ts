import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Welcome extends BaseEntity {
  @PrimaryGeneratedColumn()
  welcome_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description1: string;

  @Column({ type: 'text' })
  description2: string;

  @Column()
  image: string;
}
