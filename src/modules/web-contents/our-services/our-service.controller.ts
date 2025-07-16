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
import { CreateOurServiceDto } from './dto/create-our-service.dto';
import { UpdateOurServiceDto } from './dto/update-our-service.dto';
import { OurServiceService } from './our-service.service';

@Controller('our-service')
export class OurServiceController {
  constructor(private readonly service: OurServiceService) {}

  @Post()
  async create(
    @Body() createOurServiceDto: CreateOurServiceDto,
  ): Promise<Response> {
    return await this.service.create(createOurServiceDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.service.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOurServiceDto: UpdateOurServiceDto,
  ): Promise<Response> {
    return await this.service.update(id, updateOurServiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.service.delete(id);
  }
}
