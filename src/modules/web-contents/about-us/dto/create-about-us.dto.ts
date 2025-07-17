import { IsOptional } from 'class-validator';

export class CreateAboutUsDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  description2: string;

  @IsOptional()
  youtube_link: string;
}
