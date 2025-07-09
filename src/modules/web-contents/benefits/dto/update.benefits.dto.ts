import { IsOptional } from 'class-validator';

export class UpdateBenefitDto {
  @IsOptional()
  title: string;

  image: string;
}
