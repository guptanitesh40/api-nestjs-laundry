import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CouponType, DiscountType } from 'src/enum/coupon_type.enum';
export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  start_time: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  end_time: Date;

  @IsNumber()
  @IsNotEmpty()
  total_usage_count: number;

  @IsNumber()
  @IsNotEmpty()
  maximum_usage_count_per_user: number;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: number;

  @IsNumber()
  @IsNotEmpty()
  discount_value: number;

  @IsNotEmpty()
  @IsEnum(CouponType)
  coupon_type: number;

  @IsOptional()
  min_cart_value: number;
}
