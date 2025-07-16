import { IsOptional } from 'class-validator';

export class CreateWelcomeDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description1: string;

  @IsOptional()
  description2: string;

  @IsOptional()
  image: string;
}
