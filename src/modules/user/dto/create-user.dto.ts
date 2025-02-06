import {
  IsArray,
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { User } from 'src/entities/user.entity';
import { Gender } from 'src/enum/gender.enum';
import { IsUnique } from 'src/modules/validator/is-unique';

export class CreateUserDto {
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

  password: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  role_id: number;

  @IsOptional()
  @IsNumber()
  created_by_user_id?: number;

  @IsOptional()
  vendor_code?: string;

  @IsOptional()
  vendor_code_expiry?: Date;

  @IsOptional()
  @IsNumber()
  commission_percentage?: number;

  @IsOptional()
  @IsNumber()
  security_deposit?: number;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  company_ids?: number[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  branch_ids?: number[];
}
