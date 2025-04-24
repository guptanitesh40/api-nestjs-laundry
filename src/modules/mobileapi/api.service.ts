import { Injectable } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { BannerType } from 'src/enum/banner_type.enum';
import { AddressService } from '../address/address.service';
import { BannerService } from '../banner/banner.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { PriceService } from '../price/price.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class ApiService {
  constructor(
    private readonly serviceService: ServicesService,
    private readonly bannerService: BannerService,
    private readonly priceService: PriceService,
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
  ) {}

  async findAll(user_id: number): Promise<Response> {
    const banner_type = [BannerType.APP, BannerType.BOTH];
    const [service, banners, invoice, cart, defaultAddress] = await Promise.all(
      [
        (await this.serviceService.getAll()).data,
        (await this.bannerService.getAll(banner_type)).data,
        (await this.orderService.pendingDueAmount(user_id)).data,
        (await this.cartService.getAllCarts(user_id)).data,
        await this.addressService.getDefaultAddress(user_id),
      ],
    );

    const services = service.services;
    const banner = banners.banner;

    const invoice_list = invoice.result;
    const total_pending_due_amount = invoice.totalPendingAmount;

    const cart_count = cart.cart_count;

    const notification_count = 0;

    return {
      statusCode: 200,
      message: 'Services and banners retrieved successfully',
      data: {
        services: services,
        banner,
        invoice_list,
        total_pending_due_amount,
        cart_count,
        notification_count,
        defaultAddress,
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
