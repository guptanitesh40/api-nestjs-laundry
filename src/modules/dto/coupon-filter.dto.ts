import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class CouponFiltrerDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coupon_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount_type?: number;
}
