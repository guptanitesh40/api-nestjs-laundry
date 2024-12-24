import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class CouponFiltrerDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  coupon_types?: number[];

  @applyNumberArrayValidation()
  discount_types?: number;
}
