import { IsOptional, IsString } from 'class-validator';
import { applyNumberArrayValidation } from 'src/utils/validation-helper';

export class ReportFilterDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @applyNumberArrayValidation()
  user_id?: number[];

  @applyNumberArrayValidation()
  company_id?: number[];

  @applyNumberArrayValidation()
  branch_id?: number[];

  @applyNumberArrayValidation()
  driver_id?: number[];

  @IsOptional()
  format?: string;
}
