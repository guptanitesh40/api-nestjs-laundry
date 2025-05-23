import { IsOptional } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  name: string;

  @IsOptional()
  name_hindi: string;

  @IsOptional()
  name_gujarati: string;

  @IsOptional()
  image: string;

  @IsOptional()
  description: string;

  @IsOptional()
  is_visible: boolean;
}
