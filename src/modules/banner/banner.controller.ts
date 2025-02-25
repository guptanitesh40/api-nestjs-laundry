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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { BannerFilterDto } from '../dto/banner-filter.dto';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('banners')
  @Roles(Role.CUSTOMER)
  async getAll(): Promise<Response> {
    return await this.bannerService.getAll();
  }

  @Post('admin/banners')
  @UseInterceptors(FileInterceptor('image', fileUpload(FilePath.BANNER_IMAGES)))
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provide', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.BANNER_IMAGES + '/' + file.filename;
    return this.bannerService.create(createBannerDto, imagePath);
  }

  @Get('admin/banners')
  async findAll(@Query() bannerFilterDto: BannerFilterDto) {
    return this.bannerService.findAll(bannerFilterDto);
  }

  @Get('admin/banners/:id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.bannerService.findOne(id);
  }

  @Put('admin/banners/:id')
  @UseInterceptors(FileInterceptor('image', fileUpload(FilePath.BANNER_IMAGES)))
  async update(
    @Param('id') id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file
      ? FilePath.BANNER_IMAGES + '/' + file.filename
      : null;
    return await this.bannerService.update(id, updateBannerDto, imagePath);
  }

  @Delete('admin/banners/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Response> {
    return await this.bannerService.delete(id);
  }
}
