import { IsOptional } from 'class-validator';

export class UpdateWhyChooseUsDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;
}
