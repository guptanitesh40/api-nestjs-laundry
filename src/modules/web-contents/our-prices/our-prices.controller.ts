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
import { CreateOurPriceDto } from './dto/create-our-prices.dto';
import { UpdateOurPriceDto } from './dto/update-our-services.dto';
import { OurPriceService } from './our-prices.service';

@Controller('our-price')
export class OurPriceController {
  constructor(private readonly service: OurPriceService) {}

  @Post()
  async create(
    @Body() createOurPriceDto: CreateOurPriceDto,
  ): Promise<Response> {
    return await this.service.create(createOurPriceDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.service.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOurPriceDto: UpdateOurPriceDto,
  ): Promise<Response> {
    return await this.service.update(id, updateOurPriceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.service.delete(id);
  }
}
