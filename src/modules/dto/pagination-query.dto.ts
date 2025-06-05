import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  per_page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page_number?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  start_date?: string;

  @IsOptional()
  end_date?: string;

  @IsOptional()
  customer_name?: string;

  @IsOptional()
  order_status?: number;
}
