import { CompanyOwed } from 'src/enum/company_owed.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { UserCompanyMapping } from './user-company-mapping.entity';

@Entity({ name: 'companies' })
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  company_id: number;

  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  zip_code: string;

  @Column({ type: 'varchar', length: 255 })
  company_owner_name: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_number: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  website: string;

  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @Column({ type: 'varchar', length: 100 })
  registration_number: string;

  @Column({ type: 'date' })
  registration_date: Date;

  @Column({ type: 'varchar', length: 20 })
  gstin: string;

  @Column({ type: 'int', nullable: true })
  company_ownedby: CompanyOwed;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contract_document: string;

  @OneToMany(() => Branch, (branch) => branch.company)
  branches: Branch[];

  @OneToMany(
    () => UserCompanyMapping,
    (userCompanyMapping) => userCompanyMapping.company,
  )
  userCompanyMappings: UserCompanyMapping[];
}
