import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'settings' })
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  setting_id: number;

  @Column()
  setting_key: string;

  @Column()
  setting_value: string;

  @Column({ type: 'float', nullable: true })
  gst?: number;
}
