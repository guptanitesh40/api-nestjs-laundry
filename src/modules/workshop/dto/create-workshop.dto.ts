import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateWorkshopDto {
  @IsOptional()
  workshop_name: string;

  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  mobile_number: string;

  @IsArray()
  @IsOptional()
  user_ids?: number[];
}
