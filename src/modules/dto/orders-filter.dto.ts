import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class OrderFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  orderstatus?: number[];

  @applyNumberArrayValidation()
  customer_id?: number[];

  @applyNumberArrayValidation()
  branch_id?: number[];

  @applyNumberArrayValidation()
  pickup_boy_id?: number[];

  @applyNumberArrayValidation()
  delivery_boy_id?: number[];

  @applyNumberArrayValidation()
  payment_type?: number[];

  @applyNumberArrayValidation()
  payment_status?: number[];

  @applyNumberArrayValidation()
  workshop_id?: number[];

  @applyNumberArrayValidation()
  workshop_manager_id?: number[];
}
