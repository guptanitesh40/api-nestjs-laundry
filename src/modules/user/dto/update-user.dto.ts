import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Gender } from 'src/enum/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  mobile_number?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  image?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  role_id?: number;

  @IsOptional()
  id_proof?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  company_ids?: number[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  branch_ids?: number[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  workshop_ids?: number[];
}
