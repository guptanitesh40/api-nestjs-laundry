import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsNotEmpty()
  order_id: number;

  @IsString()
  @IsNotEmpty()
  text_note: string;
}
