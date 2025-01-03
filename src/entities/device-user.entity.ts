import { IsOptional } from 'class-validator';
import { DeviceType } from 'src/enum/device_type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'device_users' })
export class DeviceUser {
  @PrimaryGeneratedColumn()
  device_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ nullable: true })
  @IsOptional()
  device_type?: DeviceType;

  @Column({ nullable: true })
  @IsOptional()
  device_token?: string;

  @ManyToOne(() => User, (user) => user.deviceUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
