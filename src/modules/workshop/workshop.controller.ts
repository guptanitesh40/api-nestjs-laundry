import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { WorkshopService } from './workshop.service';

@Controller('workshops')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  async create(
    @Body() createWorkshopDto: CreateWorkshopDto,
  ): Promise<Response> {
    return this.workshopService.create(createWorkshopDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.workshopService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.workshopService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return await this.workshopService.update(id, updateWorkshopDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.workshopService.delete(id);
  }
}
