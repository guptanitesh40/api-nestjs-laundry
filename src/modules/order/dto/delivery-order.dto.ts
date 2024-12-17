import { IsArray, IsOptional, IsString } from 'class-validator';

export class DeliveryOrderDto {
  @IsOptional()
  user_id: number;

  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[] = [];
}
