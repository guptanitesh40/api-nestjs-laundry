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
import { CreateLaundryHistoryDto } from './dto/create-laundry-history.dto';
import { UpdateLaundryHistoryDto } from './dto/update-laundry-history.dto';
import { LaundryHistoryService } from './laundry-history.service';

@Controller('laundry-history')
export class LaundryHistoryController {
  constructor(private readonly laundryHistoryService: LaundryHistoryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async create(
    @Body() createLaundryHistoryDto: CreateLaundryHistoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provide', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.SERVICE_LIST_IMAGES + '/' + file.filename;
    return this.laundryHistoryService.create(
      createLaundryHistoryDto,
      imagePath,
    );
  }

  @Get()
  async findAll() {
    return await this.laundryHistoryService.findAll();
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_LIST_IMAGES)),
  )
  async update(
    @Param('id') id: number,
    @Body() updateLaundryHistoryDto: UpdateLaundryHistoryDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file
      ? FilePath.SERVICE_LIST_IMAGES + '/' + file.filename
      : null;
    return await this.laundryHistoryService.update(
      id,
      updateLaundryHistoryDto,
      imagePath,
    );
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Response> {
    return await this.laundryHistoryService.delete(id);
  }
}
