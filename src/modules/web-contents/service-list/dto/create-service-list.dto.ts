import { IsNotEmpty } from 'class-validator';

export class CreateServiceListDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  image: string;
}
