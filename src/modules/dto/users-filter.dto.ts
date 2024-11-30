import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class UserFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  branch_id?: number[];

  @applyNumberArrayValidation()
  role?: number[];

  @applyNumberArrayValidation()
  gender?: number[];

  @applyNumberArrayValidation()
  company_id?: number[];
}
