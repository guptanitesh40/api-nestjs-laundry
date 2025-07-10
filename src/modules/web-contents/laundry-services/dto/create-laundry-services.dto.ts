import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLaundryListDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  image: string;

  @IsOptional()
  note?: string;
}
