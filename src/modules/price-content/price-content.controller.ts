import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { CreatePriceContentDto } from './dto/create-price-content.dto';
import { UpdatePriceContentDto } from './dto/update-price-content.dto';
import { PriceContentService } from './price-content.service';

@Controller('price-content')
export class PriceContentController {
  constructor(private readonly priceContentService: PriceContentService) {}

  @Post()
  async create(
    @Body() createPriceContentDto: CreatePriceContentDto,
  ): Promise<Response> {
    return await this.priceContentService.create(createPriceContentDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.priceContentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.priceContentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePriceContentDto: UpdatePriceContentDto,
  ) {
    return await this.priceContentService.update(id, updatePriceContentDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Response> {
    return await this.priceContentService.delete(id);
  }
}
