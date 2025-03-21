import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsNumber()
  mobile_number: number;

  @IsNotEmpty()
  otp: number;

  @IsNotEmpty()
  new_password: string;

  @IsOptional()
  role_id: number;
}
