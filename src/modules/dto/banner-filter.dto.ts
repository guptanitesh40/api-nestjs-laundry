import { applyNumberArrayValidation } from 'src/utils/validation-helper';
import { PaginationQueryDto } from './pagination-query.dto';

export class BannerFilterDto extends PaginationQueryDto {
  @applyNumberArrayValidation()
  banner_type?: number[];
}
