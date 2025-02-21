import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, ValidateNested } from 'class-validator';

export class RolePermissionItemDto {
  @IsNumber()
  role_id: number;

  @IsNumber()
  module_id: number;

  @IsBoolean()
  create?: boolean;

  @IsBoolean()
  update?: boolean;

  @IsBoolean()
  read?: boolean;

  @IsBoolean()
  delete?: boolean;
}

export class RolePermissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionItemDto)
  rolePermission: RolePermissionItemDto[];
}
