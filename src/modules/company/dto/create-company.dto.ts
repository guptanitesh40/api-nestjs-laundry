import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { CompanyOwed } from 'src/enum/company_owed.enum';

export class CreateCompanyDto {
  @IsString()
  company_name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @Length(6, 6)
  zip_code: string;

  @IsString()
  company_owner_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  mobile_number: string;

  @IsString()
  email: string;

  @IsString()
  website: string;

  @IsOptional()
  logo?: string;

  @IsString()
  registration_number: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  registration_date: Date;

  @IsString()
  gstin: string;

  @IsOptional()
  gst_percentage: number;

  @IsOptional()
  signature_image: string;

  @IsOptional()
  hsn_sac_code: string;

  @IsOptional()
  msme_number: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(CompanyOwed)
  company_ownedby: number;

  @ValidateIf((o) => o.company_ownedby === CompanyOwed.OTHER_COMPANY)
  @IsOptional()
  @IsString()
  contract_document?: string;
}
