import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'src/dto/response.dto';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { CreateLabelDto } from './dto/create-label.dto';
import { LabelService } from './label.service';

@Controller('label')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class LabelController {
  constructor(private readonly labelManagmentService: LabelService) {}

  @Post()
  async create(@Body() createLabelDto: CreateLabelDto): Promise<Response> {
    return this.labelManagmentService.create(createLabelDto);
  }

  @Get()
  async getAll(): Promise<any> {
    return this.labelManagmentService.getAll();
  }

  @Patch()
  async bulkUpdate(
    @Body() labelUpdates: Array<Record<string, any>>,
  ): Promise<any> {
    return this.labelManagmentService.update(labelUpdates);
  }
}
