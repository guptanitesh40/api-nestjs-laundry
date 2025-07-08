import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { CreateWhyChooseUsDto } from './dto/create-why-choose-us.dto';
import { UpdateWhyChooseUsDto } from './dto/update-why-choose-us.dto';
import { WhyChooseUsService } from './why-choose-us.service';

@Controller('why-choose-us')
export class WhyChooseUsController {
  constructor(private readonly whyChooseUsService: WhyChooseUsService) {}

  @Post()
  async create(
    @Body() createWhyChooseUsDto: CreateWhyChooseUsDto,
  ): Promise<Response> {
    return this.whyChooseUsService.create(createWhyChooseUsDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.whyChooseUsService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWhyChooseUsDto: UpdateWhyChooseUsDto,
  ): Promise<Response> {
    return await this.whyChooseUsService.update(id, updateWhyChooseUsDto);
  }
}
