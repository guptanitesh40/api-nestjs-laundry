import { IsOptional } from 'class-validator';

export class CreateBenefitDto {
  @IsOptional()
  title: string;

  image: string;
}
