import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class BranchFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_name?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branch_manager?: number;
}
