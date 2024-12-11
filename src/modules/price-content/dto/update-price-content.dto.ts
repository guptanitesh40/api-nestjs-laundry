import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceContentDto } from './create-price-content.dto';

export class UpdatePriceContentDto extends PartialType(CreatePriceContentDto) {}
