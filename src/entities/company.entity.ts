import { CompanyOwed } from 'src/enum/company_owed.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';

@Entity({ name: 'companies' })
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  company_id: number;

  @Column({ type: 'varchar', length: 255 })
  company_Name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  zip_code: string;

  @Column({ type: 'varchar', length: 255 })
  company_Owner_Name: string;

  @Column({ type: 'varchar', length: 20 })
  phone_Number: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_Number: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  website: string;

  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @Column({ type: 'varchar', length: 100 })
  registration_Number: string;

  @Column({ type: 'date' })
  registration_Date: Date;

  @Column({ type: 'varchar', length: 20 })
  gstin: string;

  @Column({ type: 'int', nullable: true })
  company_OwnedBy: CompanyOwed;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contract_Document: string;

  @OneToMany(() => Branch, (branch) => branch.company)
  branches: Branch[];
}
