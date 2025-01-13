import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  setting_key: string;

  @IsString()
  @IsOptional()
  setting_value?: string;

  @IsOptional()
  @IsString()
  home_banner_image?: string;
}

export class ArraySettingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingDto)
  settings: UpdateSettingDto[];
}
