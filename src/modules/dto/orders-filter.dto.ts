import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class OrderFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  order_statuses?: number[];

  @applyNumberArrayValidation()
  customer_ids?: number[];

  @applyNumberArrayValidation()
  branches_ids?: number[];

  @applyNumberArrayValidation()
  pickup_boy_ids?: number[];

  @applyNumberArrayValidation()
  delivery_boy_ids?: number[];

  @applyNumberArrayValidation()
  payment_types?: number[];

  @applyNumberArrayValidation()
  payment_statuses?: number[];

  @applyNumberArrayValidation()
  workshop_ids?: number[];

  @applyNumberArrayValidation()
  workshop_manager_ids?: number[];
}
