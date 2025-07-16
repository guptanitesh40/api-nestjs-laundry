import { PartialType } from '@nestjs/mapped-types';
import { CreateLaundryBranchDto } from './create-laundry-branch.dto';

export class UpdateLaundryBranchDto extends PartialType(
  CreateLaundryBranchDto,
) {}
