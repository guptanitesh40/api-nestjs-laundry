import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class CompanyFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  companies_ownedby?: number;
}
