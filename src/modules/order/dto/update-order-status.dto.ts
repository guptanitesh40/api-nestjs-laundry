import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OrderStatus } from 'src/enum/order-status.eum';

export class UpdateOrderStatusDto {
  @IsArray()
  @IsNumber({}, { each: true })
  order_ids: number[];

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  order_status: OrderStatus;
}
