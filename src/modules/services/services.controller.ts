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
import { fileUpload } from '../../multer/image-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PriceService } from '../price/price.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
  constructor(
    private readonly serviceService: ServicesService,
    private readonly priceService: PriceService,
  ) {}

  @Get('services')
  @Roles(Role.CUSTOMER)
  async getAll(): Promise<Response> {
    return await this.serviceService.getAll();
  }

  @Get('admin/services')
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return await this.serviceService.findAll(paginationQueryDto);
  }

  @Get('admin/services/:id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.serviceService.findOne(id);
  }

  @Post('admin/services')
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_IMAGES)),
  )
  async create(
    @Body() createserviceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File must be provided', HttpStatus.BAD_REQUEST);
    }

    const imagepath = FilePath.SERVICE_IMAGES + '/' + file.filename;
    return this.serviceService.create(createserviceDto, imagepath);
  }

  @Put('admin/services/:id')
  @UseInterceptors(
    FileInterceptor('image', fileUpload(FilePath.SERVICE_IMAGES)),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file
      ? FilePath.SERVICE_IMAGES + '/' + file.filename
      : null;
    return await this.serviceService.update(id, updateServiceDto, imagePath);
  }

  @Delete('admin/services/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.serviceService.delete(id);
  }

  @Get('category/:category_id/product/:product_id/service')
  async getServiceByCategoryAndProduct(
    @Param('category_id', ParseIntPipe) category_id: number,
    @Param('product_id', ParseIntPipe) product_id: number,
  ): Promise<Response> {
    const services = await this.priceService.getServiceByCategoryAndProduct(
      category_id,
      product_id,
    );
    return {
      statusCode: 200,
      message: 'service retrieved successfully',
      data: services,
    };
  }
}
