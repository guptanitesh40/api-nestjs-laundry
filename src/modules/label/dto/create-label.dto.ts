import { IsNotEmpty } from 'class-validator';

export class CreateLabelDto {
  @IsNotEmpty()
  label_name: string;
}
