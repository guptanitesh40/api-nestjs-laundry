import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Workshop } from './workshop.entity';

@Entity('workshop_manager_mapping')
export class WorkshopManagerMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.workshopManagerMappings, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => Workshop, (workshop) => workshop.workshopManagerMappings, {
    nullable: false,
  })
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  @Column({ nullable: true })
  workshop_id: number;
}
