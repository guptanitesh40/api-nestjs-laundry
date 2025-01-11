import { IsArray, IsNumber, IsString } from 'class-validator';

export class ClearDueAmount {
  @IsNumber()
  pay_amount: number;

  @IsNumber()
  payment_status: number;

  @IsString()
  transaction_id: string;

  @IsArray()
  order_ids: number[];
}
