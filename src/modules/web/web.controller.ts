import { Controller, Get, Query, Request } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { BannerService } from '../banner/banner.service';
import { ApiService } from '../mobileapi/api.service';
import { ServicesService } from '../services/services.service';

@Controller('web')
export class WebController {
  constructor(
    private readonly apiService: ApiService,
    private readonly serviceService: ServicesService,
    private readonly bannerService: BannerService,
  ) {}

  @Get('banners')
  async getAllBanners(): Promise<Response> {
    return await this.bannerService.getAll();
  }

  @Get('products')
  async getProductsByCategoryAndService(
    @Request() req,
    @Query('category_id') category_id: number,
    @Query('service_id') service_id: number,
  ): Promise<Response> {
    const user_id = req.user;
    return await this.apiService.getProductsByCategoryAndService(
      category_id,
      service_id,
      user_id,
    );
  }

  @Get('categories')
  async getCategoriesByService(
    @Query('service_id') service_id: number,
  ): Promise<Response> {
    return await this.apiService.getCategoriesByService(service_id);
  }

  @Get('services')
  async getAllServices(): Promise<Response> {
    return await this.serviceService.getAll();
  }
}
