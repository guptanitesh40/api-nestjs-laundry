import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Response } from 'src/dto/response.dto';
import { fileUpload } from 'src/multer/image-upload';
import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUs } from './dto/update-about-us.dto';

@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async create(
    @Body() dto: CreateAboutUsDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provide', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.SERVICE_LIST_IMAGES + '/' + file.filename;
    return this.aboutUsService.create(dto, imagePath);
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
