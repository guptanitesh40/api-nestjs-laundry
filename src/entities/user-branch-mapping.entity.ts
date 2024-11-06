import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';

@Entity('user_branch_mapping')
export class UserBranchMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_branch_mapping_id: number;

  @ManyToOne(() => User, (user) => user.userBranchMapping, { nullable: false })
  user: User;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => Branch, (branch) => branch.userBranchMapping, {
    nullable: false,
  })
  branch: Branch;

  @Column({ nullable: true })
  branch_id: number;
}
