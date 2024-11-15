import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from 'src/enum/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDecimal()
  mobile_number?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  role_id?: number;

  @IsOptional()
  id_proof?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  company_ids?: number[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  branch_ids?: number[];
}
