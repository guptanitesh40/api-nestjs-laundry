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
  @Type(() => Number)
  @IsNumber()
  orderstatus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customer_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pickup_boy_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  delivery_boy_id?: number;

  @IsOptional()
  @Type(() => Number)
  payment_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  payment_status?: number;

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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  banner_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_name?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branch_manager?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  company_ownedby?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coupon_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount_type?: number;
}
