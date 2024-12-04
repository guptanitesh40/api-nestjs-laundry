import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class BranchFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  company_id?: number[];

  @applyNumberArrayValidation()
  branch_manager_id?: number[];
}
