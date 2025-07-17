import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHomePageDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
