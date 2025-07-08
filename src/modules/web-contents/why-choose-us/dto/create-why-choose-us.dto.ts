import { IsNotEmpty } from 'class-validator';

export class CreateWhyChooseUsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
