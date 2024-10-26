import { IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '../enum/gender.enum';
import { UserAddress } from './address.entity';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Cart } from './cart.entity';
import { DeviceUser } from './device-user.entity';
import { LoginHistory } from './login-history.entity';
import { Note } from './note.entity';
import { OrderDetail } from './order.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'decimal', nullable: true })
  mobile_number: number;

  @Column()
  password: string;

  @Column({ type: 'int', nullable: true })
  gender: Gender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  image?: string;

  @Column()
  role_id: number;

  @Column({ nullable: true })
  @IsOptional()
  created_by_user_id?: number;

  @Column({ nullable: true })
  @IsOptional()
  vendor_code?: string;

  @Column({ nullable: true })
  @IsOptional()
  vendor_id?: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  vendor_code_expiry?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  commission_percentage?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  security_deposit?: number;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => UserAddress, (address) => address.user, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  addresses: UserAddress[];

  @OneToMany(() => DeviceUser, (deviceUser) => deviceUser.user, {
    cascade: true,
  })
  deviceUsers: DeviceUser[];

  @OneToMany(() => LoginHistory, (loginHistory) => loginHistory.user)
  loginHistories: LoginHistory[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.user)
  orders: OrderDetail[];

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.delivery_boy)
  ordersAsDeliveryBoy: OrderDetail[];

  @OneToMany(() => Branch, (branch) => branch.branchManager)
  branches: Branch[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];
}
