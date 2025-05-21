import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  name_hindi: string;

  @IsOptional()
  name_gujarati: string;

  image: string;

  @IsOptional()
  description: string;
}
