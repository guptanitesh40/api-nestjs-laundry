import { IsOptional } from 'class-validator';

export class UpdateLaundryServicesDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  image: string;

  @IsOptional()
  note?: string;
}
