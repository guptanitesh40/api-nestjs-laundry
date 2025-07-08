import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Response } from 'src/dto/response.dto';
import { fileUpload } from 'src/multer/image-upload';
import { CreateServiceListDto } from './dto/create-service-list.dto';
import { UpdateServiceListDto } from './dto/update.service-list.dto';
import { ServiceListService } from './service.list.service';

@Controller('services-list')
export class ServiceListController {
  constructor(private readonly serviceListService: ServiceListService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async create(
    @Body() createServiceListDto: CreateServiceListDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provide', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.SERVICE_LIST_IMAGES + '/' + file.filename;
    return this.serviceListService.create(createServiceListDto, imagePath);
  }

  @Get()
  async getAllServices() {
    return await this.serviceListService.findAll();
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async update(
    @Param('id') id: number,
    @Body() updateBannerDto: UpdateServiceListDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file
      ? FilePath.SERVICE_LIST_IMAGES + '/' + file.filename
      : null;
    return await this.serviceListService.update(id, updateBannerDto, imagePath);
  }
}
