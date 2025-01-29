import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class OrderDto {
  @IsOptional()
  @IsNumber()
  order_id: number;

  @IsOptional()
  @IsNumber()
  paid_amount: number;

  @IsOptional()
  @IsNumber()
  payment_status: number;

  @IsOptional()
  @IsNumber()
  kasar_amount: number;
}

export class OrdersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders: OrderDto[];
}
