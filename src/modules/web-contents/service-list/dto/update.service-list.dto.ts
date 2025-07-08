import { IsOptional } from 'class-validator';

export class UpdateServiceListDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  image: string;
}
