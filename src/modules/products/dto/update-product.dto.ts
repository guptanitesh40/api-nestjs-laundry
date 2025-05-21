import { IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name: string;

  @IsOptional()
  name_hindi: string;

  @IsOptional()
  name_gujarati: string;

  @IsOptional()
  image: string;
}
