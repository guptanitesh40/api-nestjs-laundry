import { IsArray, IsOptional, IsString } from 'class-validator';

export class DeliveryOrderDto {
  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[] = [];
}
