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

  @Column()
  role_id: number;

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
}
