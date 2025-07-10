import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'corporate_services' })
export class CorporateService extends BaseEntity {
  @PrimaryGeneratedColumn()
  corporate_service_id: number;

  @Column()
  title: string;
}
