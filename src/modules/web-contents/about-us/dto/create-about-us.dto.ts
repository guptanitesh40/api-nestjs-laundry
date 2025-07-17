import { IsOptional } from 'class-validator';

export class CreateAboutUsDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description1: string;

  @IsOptional()
  description2: string;

  @IsOptional()
  image: string;

  @IsOptional()
  description3: string;

  @IsOptional()
  description4: string;

  @IsOptional()
  youtube_link: string;
}
