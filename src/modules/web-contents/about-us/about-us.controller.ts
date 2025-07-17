import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { FilePath } from 'src/constants/FilePath';
import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUs } from './dto/update-about-us.dto';

@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Post()
  async create(@Body() dto: CreateAboutUsDto) {
    return await this.aboutUsService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.aboutUsService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAboutUs: UpdateAboutUs,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file
      ? FilePath.SERVICE_LIST_IMAGES + '/' + file.filename
      : null;

    return await this.aboutUsService.update(id, updateAboutUs, imagePath);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.aboutUsService.delete(id);
  }
}
