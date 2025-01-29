import { IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'login_history' })
export class LoginHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  login_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User, (user) => user.loginHistories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  type?: string;
}
