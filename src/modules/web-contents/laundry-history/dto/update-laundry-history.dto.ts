import { PartialType } from '@nestjs/mapped-types';
import { CreateLaundryHistoryDto } from './create-laundry-history.dto';

export class UpdateLaundryHistoryDto extends PartialType(
  CreateLaundryHistoryDto,
) {}
