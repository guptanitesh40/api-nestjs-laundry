import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateLabelDto } from './dto/create-label.dto';
import { LabelService } from './label.service';

@Controller('label')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  async create(@Body() createLabelDto: CreateLabelDto): Promise<Response> {
    return this.labelService.create(createLabelDto);
  }

  @Get()
  async getAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return await this.labelService.getAll(paginationQueryDto);
  }

  @Patch()
  async update(@Body() labelUpdates: Array<Record<string, any>>): Promise<any> {
    return this.labelService.update(labelUpdates);
  }

  @Get('mobile-content')
  @Roles(Role.CUSTOMER)
  getLabelsByLanguage(@Query('language_code') language_code: string) {
    return this.labelService.getLabelsByLanguage(language_code);
  }
}
