import { PartialType } from '@nestjs/mapped-types';
import { CreateOurPriceDto } from './create-our-prices.dto';

export class UpdateOurPriceDto extends PartialType(CreateOurPriceDto) {}
