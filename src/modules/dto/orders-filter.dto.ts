import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class OrderFilterDto extends PaginationQueryDto {
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
  @IsNumber()
  payment_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  payment_status?: number;
}
