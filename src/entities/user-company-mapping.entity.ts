import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('user_company_mapping')
export class UserCompanyMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_company_mapping_id: number;

  @ManyToOne(() => User, (user) => user.userCompanyMpgs, { nullable: false })
  user: User;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => Company, (company) => company.userCompanyMpgs, {
    nullable: false,
  })
  company: Company;

  @Column({ nullable: true })
  company_id: number;
}
