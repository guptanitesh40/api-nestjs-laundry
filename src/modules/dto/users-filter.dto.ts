import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class UserFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  branches_ids?: number[];

  @applyNumberArrayValidation()
  roles?: number[];

  @applyNumberArrayValidation()
  genders?: number[];

  @applyNumberArrayValidation()
  companies_ids?: number[];
}
