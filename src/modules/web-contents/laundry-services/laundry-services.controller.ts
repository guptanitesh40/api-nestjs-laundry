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
import { CreateLaundryListDto } from './dto/create-laundry-services.dto';
import { UpdateLaundryServicesDto } from './dto/update-laundry-services';
import { LaundryServicesService } from './laundry-services.service';

@Controller('laundry-services')
export class LaundryServicesController {
  constructor(
    private readonly laundryServicesService: LaundryServicesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async create(
    @Body() createLaundryListDto: CreateLaundryListDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provide', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.SERVICE_LIST_IMAGES + '/' + file.filename;
    return this.laundryServicesService.create(createLaundryListDto, imagePath);
  }

  @Get()
  async getAllServices() {
    return await this.laundryServicesService.findAll();
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async update(
    @Param('id') id: number,
    @Body() updateLaundryServicesDto: UpdateLaundryServicesDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file
      ? FilePath.SERVICE_LIST_IMAGES + '/' + file.filename
      : null;
    return await this.laundryServicesService.update(
      id,
      updateLaundryServicesDto,
      imagePath,
    );
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Response> {
    return await this.laundryServicesService.delete(id);
  }
}
