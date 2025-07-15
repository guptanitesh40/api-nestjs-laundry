import { IsOptional } from 'class-validator';

export class CreateLaundryBranchDto {
  @IsOptional()
  name: string;

  @IsOptional()
  address: string;

  @IsOptional()
  phone_number1?: string;

  @IsOptional()
  phone_number2?: string;

  @IsOptional()
  lat?: string;

  @IsOptional()
  long?: string;
}
