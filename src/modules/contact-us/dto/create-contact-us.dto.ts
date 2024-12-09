import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactUsDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
