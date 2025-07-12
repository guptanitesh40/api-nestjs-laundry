import { IsOptional } from 'class-validator';

export class CreateLaundryHistoryDto {
  @IsOptional()
  year: number;

  @IsOptional()
  description: string;

  image: string;
}
