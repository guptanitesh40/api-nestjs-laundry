import { IsNumber, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  branch_name: string;

  @IsString()
  branch_address: string;

  @IsNumber()
  branch_manager_id: number;

  @IsString()
  branch_phone_number: string;

  @IsString()
  branch_email: string;

  @IsString()
  branch_registration_number: string;

  @IsNumber()
  company_id: number;
}
