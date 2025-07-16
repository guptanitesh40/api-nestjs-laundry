import { IsOptional } from 'class-validator';

export class CreateOurServiceDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  note: string;
}
