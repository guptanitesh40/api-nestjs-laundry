import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressType } from 'src/enum/address_type.enum';

export class CreateAddressDto {
  @IsNumber()
  @IsOptional()
  user_id: number;

  @IsOptional()
  @IsEnum(AddressType)
  address_type?: AddressType;

  @IsString()
  @IsOptional()
  full_name: string;

  @IsString()
  @IsOptional()
  phone_number: string;

  @IsString()
  @IsOptional()
  building_number: string;

  @IsString()
  @IsOptional()
  area: string;

  @IsString()
  @IsOptional()
  landmark: string;

  @IsNumber()
  @IsOptional()
  lat: number;

  @IsNumber()
  @IsOptional()
  long: number;

  @IsOptional()
  pincode: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
