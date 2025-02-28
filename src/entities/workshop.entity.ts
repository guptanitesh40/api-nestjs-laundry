import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
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

  @Column({ type: 'varchar', nullable: true, length: 20 })
  mobile_number: string;

  @OneToMany(
    () => WorkshopManagerMapping,
    (workshopManagerMapping) => workshopManagerMapping.workshop,
  )
  workshopManagerMappings: WorkshopManagerMapping[];

  @OneToMany(() => Order, (orderdetail) => orderdetail.workshop)
  orders: Order[];
}
