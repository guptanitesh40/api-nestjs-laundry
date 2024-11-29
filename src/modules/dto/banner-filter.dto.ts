import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class BannerFilterDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  banner_type?: number;
}
