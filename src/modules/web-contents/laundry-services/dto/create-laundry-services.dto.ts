import { IsNotEmpty } from 'class-validator';

export class CreateLaundryListDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  image: string;
}
