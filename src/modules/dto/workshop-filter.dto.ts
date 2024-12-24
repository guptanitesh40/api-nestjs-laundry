import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class WorkshopFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  workshop_manager_ids?: number[];
}
