import {
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from 'src/entities/user.entity';
import { DeviceType } from 'src/enum/device_type.enum';
import { Gender } from 'src/enum/gender.enum';
import { IsUnique } from 'src/modules/validator/is-unique';

export class SignupDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsOptional()
  @IsUnique({ tablename: User.name, column: 'email' })
  email: string;

  @IsNotEmpty()
  @IsDecimal()
  @IsUnique({ tablename: User.name, column: 'mobile_number' })
  mobile_number: number;

  @IsOptional()
  @IsString()
  otp?: number;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  role_id: number;

  @IsOptional()
  vendor_code?: string;

  @IsOptional()
  device_type?: DeviceType;

  @IsOptional()
  device_token?: string;
}
