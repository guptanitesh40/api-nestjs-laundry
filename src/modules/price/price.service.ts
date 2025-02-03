import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Price } from 'src/entities/price.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { DataSource, IsNull, Repository } from 'typeorm';
import { InvoiceService } from '../invoice/invoice.service';
import { CreatePriceDto } from './dto/create-price.dto';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @Inject(forwardRef(() => InvoiceService))
    private invoiceService: InvoiceService,
    private dataSource: DataSource,
  ) {}

  async create(createPriceDto: CreatePriceDto): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const validPrices = [];
      for (const priceDto of createPriceDto.prices) {
        if (priceDto.price !== 0) {
          validPrices.push(priceDto);
        }
      }

      if (validPrices.length > 0) {
        await queryRunner.manager.update(
          Price,
          { deleted_at: IsNull() },
          { deleted_at: new Date() },
        );

        await queryRunner.manager.insert(Price, createPriceDto.prices);
      }

      await queryRunner.commitTransaction();
      await this.invoiceService.generatePriceListPDF();

      return {
        statusCode: 201,
        message: 'Price added successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(requiredKeys?: string[]): Promise<Response> {
    const query = this.priceRepository
      .createQueryBuilder('price')
      .where('price.deleted_at IS NULL')
      .andWhere('price.price > 0');

    if (requiredKeys?.length) {
      requiredKeys.forEach((key, index) => {
        const [categoryId, productId, serviceId] = key.split('_');
        query.orWhere(
          `(price.category_id = :categoryId${index} AND price.product_id = :productId${index} AND price.service_id = :serviceId${index})`,
          {
            [`categoryId${index}`]: categoryId,
            [`productId${index}`]: productId,
            [`serviceId${index}`]: serviceId,
          },
        );
      });
    }

    const prices = await query.getMany();

    const result = {};
    prices.forEach((price) => {
      result[`${price.category_id}_${price.product_id}_${price.service_id}`] =
        price.price;
    });

    return {
      statusCode: 200,
      message:
        'Prices retrieved successfully (category_id, product_id, service_id)',
      data: result,
    };
  }

  async getPricesByCategoryAndService(
    category_id: number,
    service_id: number,
    user_id?: number,
  ) {
    const prices = this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.category', 'category')
      .innerJoinAndSelect('price.service', 'service')
      .innerJoinAndSelect('price.product', 'product')
      .where('category.category_id = :categoryId', { categoryId: category_id })
      .andWhere('service.service_id = :serviceId', { serviceId: service_id })
      .andWhere('price.price > 0')
      .select([
        'price',
        'category.category_id',
        'category.name',
        'product.product_id',
        'product.name',
        'product.image',
        'service.service_id',
        'service.name',
        'service.image',
      ]);

    if (user_id) {
      prices.leftJoinAndMapOne(
        'price.carts',
        'carts',
        'cart',
        'cart.product_id = price.product_id AND cart.category_id = price.category_id AND cart.service_id = price.service_id AND cart.user_id = :userId',
        { userId: user_id },
      );
    } else {
      prices.addSelect('NULL AS cart');
    }

    const result = await prices.getMany();

    return result.map((price) => ({
      ...price,
      product: {
        ...price.product,
        image: appendBaseUrlToImagesOrPdf([{ image: price.product.image }])[0]
          .image,
      },
    }));
  }

  async getServiceByCategoryAndProduct(
    category_id: number,
    product_id: number,
  ) {
    const services = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.product', 'product')
      .innerJoinAndSelect('price.category', 'category')
      .innerJoinAndSelect('price.service', 'service')
      .where('product.product_id = :product_id', { product_id: product_id })
      .andWhere('category.category_id = :category_id', {
        category_id: category_id,
      })
      .select(['service.service_id', 'service.name'])
      .groupBy('service.service_id')
      .getRawMany();

    return services;
  }

  async getCategoriesByService(service_id: number) {
    const uniqueCategories = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.category', 'category')
      .innerJoinAndSelect('price.service', 'service')
      .where('service.service_id = :service_id', { service_id: service_id })
      .groupBy('category.category_id')
      .select(['category.category_id', 'category.name'])
      .getRawMany();

    return uniqueCategories;
  }

  async getProductByCategory(category_id: number): Promise<any[]> {
    const uniqueProducts = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.category', 'category')
      .innerJoinAndSelect('price.product', 'product')
      .where('category.category_id = :category_id', { category_id })
      .select(['product.product_id', 'product.name'])
      .groupBy('product.product_id')
      .getRawMany();

    return uniqueProducts;
  }

  async getAll(): Promise<any[]> {
    const prices = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.category', 'category')
      .innerJoinAndSelect('price.product', 'product')
      .innerJoinAndSelect('price.service', 'service')
      .select(['category.name', 'product.name', 'service.name', 'price.price'])
      .groupBy('category.name, product.name, service.name,price.price')
      .orderBy('MAX(category.category_id)', 'ASC')
      .addOrderBy('MAX(product.product_id)', 'ASC')
      .addOrderBy('MAX(service.service_id)', 'ASC')
      .getRawMany();

    return prices;
  }
}
