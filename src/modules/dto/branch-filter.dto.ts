import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class BranchFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation(true)
  company_name?: string[];

  @applyNumberArrayValidation(true)
  branch_manager?: string[];
}
