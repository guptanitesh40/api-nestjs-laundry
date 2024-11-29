import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class UserFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  role?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gender?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_id?: number;
}
