import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CouponType, DiscountType } from 'src/enum/coupon_type.enum';

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  start_time: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  end_time: Date;

  @IsOptional()
  @IsNumber()
  total_usage_count?: number;

  @IsOptional()
  @IsNumber()
  maximum_usage_count_per_user?: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discount_type: number;

  @IsNumber()
  @IsOptional()
  discount_value: number;

  @IsOptional()
  @IsEnum(CouponType)
  coupon_type: number;

  @IsOptional()
  min_cart_value: number;
}
