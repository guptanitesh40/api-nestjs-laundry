import { PartialType } from '@nestjs/mapped-types';
import { CreateAboutUsDto } from './create-about-us.dto';

export class UpdateAboutUs extends PartialType(CreateAboutUsDto) {}
