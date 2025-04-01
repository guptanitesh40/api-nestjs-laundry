import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DeliveryBy } from 'src/enum/delivery_by.enum';
import { OrderStatus } from 'src/enum/order-status.eum';
import { PaymentStatus, PaymentType } from 'src/enum/payment.enum';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  coupon_code?: string;

  @IsOptional()
  @IsInt()
  coupon_discount?: number;

  @IsOptional()
  @IsNumber()
  express_delivery_charges?: number;

  @IsNumber()
  sub_total: number;

  @IsNumber()
  @IsOptional()
  normal_delivery_charges?: number;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  comment?: string;

  @IsOptional()
  @IsEnum(PaymentType)
  payment_type?: PaymentType;

  @IsNumber()
  address_id: number;

  @IsNumber()
  @IsOptional()
  user_id: number;

  @IsNumber()
  @IsOptional()
  created_by_user_id?: number;

  @IsOptional()
  @IsNumber()
  @IsEnum(OrderStatus)
  order_status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;

  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  paid_amount?: number;

  @IsOptional()
  @IsNumber()
  kasar_amount?: number;

  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @IsNumber()
  workshop_id?: number;

  @IsOptional()
  @IsNumber()
  express_delivery_hour?: number;

  @IsOptional()
  delivery_by?: DeliveryBy;
}

export class OrderItemDto {
  @IsNotEmpty()
  category_id: number;

  @IsNotEmpty()
  service_id: number;

  @IsNotEmpty()
  product_id: number;

  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
