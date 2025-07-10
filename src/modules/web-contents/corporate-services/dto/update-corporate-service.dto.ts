import { PartialType } from '@nestjs/mapped-types';
import { CreateCorporateServiceDto } from './create-corporate-service.dto';

export class UpdateCorporateServiceDto extends PartialType(
  CreateCorporateServiceDto,
) {}
