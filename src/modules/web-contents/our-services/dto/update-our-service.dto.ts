import { PartialType } from '@nestjs/mapped-types';
import { CreateOurServiceDto } from './create-our-service.dto';

export class UpdateOurServiceDto extends PartialType(CreateOurServiceDto) {}
