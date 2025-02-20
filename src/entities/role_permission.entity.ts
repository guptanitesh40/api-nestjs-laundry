import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Modules } from './modules.entity';
import { Role } from './role.entity';

@Entity({ name: 'role_permission' })
export class RolePermission extends BaseEntity {
  @PrimaryGeneratedColumn()
  role_permission_id: number;

  @ManyToOne(() => Role, (role) => role.role_permission)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  role_id: number;

  @ManyToOne(() => Modules, (modules) => modules.role_permission)
  @JoinColumn({ name: 'module_id' })
  module: Modules;

  @Column({ nullable: true })
  module_id: number;

  @Column({ nullable: true })
  create?: boolean;

  @Column({ nullable: true })
  update?: boolean;

  @Column({ nullable: true })
  read?: boolean;

  @Column({ nullable: true })
  delete?: boolean;
}
