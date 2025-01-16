import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class FeedbackFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  is_publish?: number[];

  @applyNumberArrayValidation()
  rating?: number[];

  @applyNumberArrayValidation()
  user_id?: number[];
}
