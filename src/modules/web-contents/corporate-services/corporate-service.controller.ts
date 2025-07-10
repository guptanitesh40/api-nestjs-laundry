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
import { CorporateServiceService } from './corporate-service.service';
import { CreateCorporateServiceDto } from './dto/create-corporate-service.dto';
import { UpdateCorporateServiceDto } from './dto/update-corporate-service.dto';

@Controller('corporate-service')
export class CorporateServiceController {
  constructor(private readonly service: CorporateServiceService) {}

  @Post()
  async create(
    @Body() createCorporateServiceDto: CreateCorporateServiceDto,
  ): Promise<Response> {
    return await this.service.create(createCorporateServiceDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.service.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCorporateServiceDto: UpdateCorporateServiceDto,
  ): Promise<Response> {
    return await this.service.update(id, updateCorporateServiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.service.delete(id);
  }
}
