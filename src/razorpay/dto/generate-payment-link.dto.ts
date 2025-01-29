import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CustomerDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  contact: string;

  @IsString()
  @IsOptional()
  email: string;
}

export class GeneratePaymentLinkDto {
  @IsNumber()
  @IsOptional()
  amount: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsNumber()
  @IsOptional()
  user_id: number;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer?: CustomerDto;
}
