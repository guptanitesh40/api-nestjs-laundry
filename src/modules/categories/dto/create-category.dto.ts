import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  name_hindi: string;

  @IsOptional()
  name_gujarati: string;
}
