import { PartialType } from '@nestjs/mapped-types';
import { CreateHomePageDto } from './create-home-page.dto';

export class UpdateHomePageDto extends PartialType(CreateHomePageDto) {}
