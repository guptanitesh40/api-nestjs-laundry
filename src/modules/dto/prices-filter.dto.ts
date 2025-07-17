import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class PriceFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  category_ids?: number[];

  @applyNumberArrayValidation()
  service_ids?: number[];

  @applyNumberArrayValidation()
  product_ids?: number[];
}
