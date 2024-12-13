import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCartDto {
  @IsInt()
  category_id: number;

  @IsInt()
  product_id: number;

  @IsInt()
  service_id: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  description?: string;
}
