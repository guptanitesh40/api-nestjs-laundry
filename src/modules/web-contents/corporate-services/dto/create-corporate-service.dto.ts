import { IsString } from 'class-validator';

export class CreateCorporateServiceDto {
  @IsString()
  title: string;
}
