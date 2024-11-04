import { Injectable } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { BannerService } from '../banner/banner.service';
import { PriceService } from '../price/price.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class ApiService {
  constructor(
    private readonly serviceService: ServicesService,
    private readonly bannerService: BannerService,
    private readonly priceService: PriceService,
  ) {}

  async findAll(): Promise<Response> {
    const [services, banners] = await Promise.all([
      this.serviceService.getAll(),
      this.bannerService.getAll(),
    ]);

    return {
      statusCode: 200,
      message: 'Services and banners retrieved successfully',
      data: {
        services: services,
        banners: banners,
      },
    };
  }

  async getProductsByCategoryAndService(
    category_id: number,
    service_id: number,
    user_id?: number,
  ): Promise<Response> {
    const prices = await this.priceService.getPricesByCategoryAndService(
      category_id,
      service_id,
      user_id,
    );

    return {
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: prices,
    };
  }

  async getCategoriesByService(service_id: number): Promise<Response> {
    const categories =
      await this.priceService.getCategoriesByService(service_id);

    return {
      statusCode: 200,
      message: 'Categories retrived successfully',
      data: categories,
    };
  }
}
