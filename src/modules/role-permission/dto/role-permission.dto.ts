import { IsBoolean, IsNumber } from 'class-validator';

export class RolePermissionDto {
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
