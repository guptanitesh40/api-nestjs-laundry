import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePriceContentDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @IsArray()
  @IsNotEmpty()
  service_names: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
