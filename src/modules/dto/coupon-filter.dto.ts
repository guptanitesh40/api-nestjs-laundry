import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class CouponFiltrerDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  coupon_type?: number[];

  @applyNumberArrayValidation()
  discount_type?: number[];
}
