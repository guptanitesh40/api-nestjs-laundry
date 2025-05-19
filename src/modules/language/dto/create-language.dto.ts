import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLanguageDto {
  @IsNotEmpty()
  language_name: string;

  @IsOptional()
  language_code: string;
}
