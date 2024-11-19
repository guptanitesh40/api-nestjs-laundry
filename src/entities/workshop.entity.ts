import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkshopManagerMapping } from './workshop-manager-mapping.entity';

@Entity({ name: 'workshop' })
export class Workshop extends BaseEntity {
  @PrimaryGeneratedColumn()
  workshop_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workshop_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'decimal', nullable: true })
  mobile_number: number;

  @OneToMany(
    () => WorkshopManagerMapping,
    (workshopManagerMapping) => workshopManagerMapping.workshop,
  )
  workshopManagerMappings: WorkshopManagerMapping[];
}
