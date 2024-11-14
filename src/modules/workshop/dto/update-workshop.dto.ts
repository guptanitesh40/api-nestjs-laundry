import { IsArray, IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateWorkshopDto {
  @IsString()
  @IsOptional()
  workshop_name: string;

  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsDecimal()
  @IsOptional()
  mobile_number: number;

  @IsArray()
  @IsOptional()
  user_ids?: number[];
}
