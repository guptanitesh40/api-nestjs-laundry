import { IsOptional } from 'class-validator';

export class CreateOurPriceDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;
}
