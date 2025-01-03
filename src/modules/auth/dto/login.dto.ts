import { IsNotEmpty, IsOptional } from 'class-validator';
import { DeviceType } from 'src/enum/device_type.enum';

export class LoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role_id: number;

  @IsOptional()
  device_type?: DeviceType;

  @IsOptional()
  device_token?: string;
}
