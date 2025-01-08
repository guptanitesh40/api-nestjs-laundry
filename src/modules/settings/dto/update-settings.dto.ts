import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  setting_key: string;

  @IsString()
  @IsOptional()
  setting_value: string;
}
