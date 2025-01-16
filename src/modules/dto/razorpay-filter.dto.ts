import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class RazorpayFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation(true)
  status?: string[];

  @applyNumberArrayValidation()
  user_id?: number[];
}
