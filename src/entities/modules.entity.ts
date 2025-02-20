import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RolePermission } from './role_permission.entity';

@Entity({ name: 'modules' })
export class Modules extends BaseEntity {
  @PrimaryGeneratedColumn()
  module_id: number;

  @Column()
  module_name: string;

  @OneToMany(() => RolePermission, (role_permission) => role_permission.role)
  role_permission: RolePermission[];
}
