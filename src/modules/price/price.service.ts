import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Price } from 'src/entities/price.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PriceFilterDto } from '../dto/prices-filter.dto';
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
      const incomingPrices = createPriceDto.prices.filter(
        (p) => p.price != null,
      );

      const existingPrices = await queryRunner.manager.find(Price, {
        where: { deleted_at: IsNull() },
      });

      const changedPrices = incomingPrices.filter((incoming) => {
        const existing = existingPrices.find(
          (e) =>
            e.product_id === incoming.product_id &&
            e.service_id === incoming.service_id &&
            e.category_id === incoming.category_id,
        );

        return !existing || existing.price !== incoming.price;
      });

      for (const changed of changedPrices) {
        await queryRunner.manager.update(
          Price,
          {
            product_id: changed.product_id,
            service_id: changed.service_id,
            category_id: changed.category_id,
            deleted_at: IsNull(),
          },
          { deleted_at: new Date() },
        );
      }

      if (changedPrices.length > 0) {
        await queryRunner.manager.insert(Price, changedPrices);
      }

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

  async getAllPrices(
    filterDto: PriceFilterDto,
    requiredKeys?: string[],
  ): Promise<Response> {
    const {
      page_number,
      per_page,
      search,
      category_ids,
      product_ids,
      service_ids,
      sort_by,
      order,
    } = filterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 100;
    const skip = (pageNumber - 1) * perPage;

    const query = this.priceRepository
      .createQueryBuilder('price')
      .where('price.deleted_at IS NULL')
      .andWhere('price.price > 0')
      .take(perPage)
      .skip(skip);

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

    if (search) {
      query.andWhere(
        `(LOWER(price.product_name) LIKE :search OR LOWER(price.category_name) LIKE :search OR LOWER(price.service_name) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    let sortColumn = 'price.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    query.orderBy(sortColumn, sortOrder);

    if (category_ids?.length) {
      query.andWhere('price.category_id IN (:...category_ids)', {
        category_ids,
      });
    }

    if (product_ids?.length) {
      query.andWhere('price.product_id IN (:...product_ids)', { product_ids });
    }

    if (service_ids?.length) {
      query.andWhere('price.service_id IN (:...service_ids)', { service_ids });
    }

    const [items, total] = await query.getManyAndCount();

    const result = {};
    items.forEach((price) => {
      result[`${price.category_id}_${price.product_id}_${price.service_id}`] =
        price.price;
    });

    return {
      statusCode: 200,
      message: 'Prices fetched successfully with filters and pagination.',
      data: {
        items: result,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async getPricesByCategoryAndService(
    category_id: number,
    service_id: number,
    user_id?: number,
    search?: string,
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
        'category.name_hindi',
        'category.name_gujarati',
        'product.product_id',
        'product.name',
        'product.name_hindi',
        'product.name_gujarati',
        'product.image',
        'service.service_id',
        'service.name',
        'service.name_hindi',
        'service.name_gujarati',
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

    if (search) {
      prices.andWhere('product.name LIKE :search', { search: `%${search}%` });
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
      .orderBy('service.created_at', 'ASC')
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
      .select([
        'category.category_id',
        'category.name',
        'category.name_hindi',
        'category.name_gujarati',
      ])
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
      .orderBy('product.created_at', 'ASC')
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
