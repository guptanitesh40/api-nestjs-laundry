import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplyCouponDto {
  @IsNotEmpty()
  @IsString()
  coupon_code: string;

  @IsNotEmpty()
  @IsNumber()
  order_Total: number;
}
