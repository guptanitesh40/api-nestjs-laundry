import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Price } from 'src/entities/price.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CategoryService } from '../categories/category.service';
import { PriceFilterDto } from '../dto/prices-filter.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { ProductService } from '../products/product.service';
import { ServicesService } from '../services/services.service';
import { CreatePriceDto } from './dto/create-price.dto';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @Inject(forwardRef(() => InvoiceService))
    private invoiceService: InvoiceService,
    private categoryService: CategoryService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private serviceService: ServicesService,
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
      const insertedPrices = [];

      for (const price of incomingPrices) {
        const existing = await queryRunner.manager.findOne(Price, {
          where: {
            product_id: price.product_id,
            service_id: price.service_id,
            category_id: price.category_id,
            deleted_at: IsNull(),
          },
        });

        if (!existing || existing.price !== price.price) {
          if (existing) {
            await queryRunner.manager.update(
              Price,
              { price_id: existing.price_id },
              { deleted_at: new Date() },
            );
          }

          insertedPrices.push(price);
        }
      }

      if (insertedPrices.length > 0) {
        await queryRunner.manager.insert(Price, insertedPrices);
      }

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: 'Prices updated successfully',
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

  async getAllPrices(filterDto: PriceFilterDto): Promise<Response> {
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

    const [categoryRes, productRes, serviceRes] = await Promise.all([
      this.categoryService.getAll(),
      this.productService.getAll(),
      this.serviceService.getAll(),
    ]);

    const categories = Array.isArray(categoryRes?.data?.category)
      ? categoryRes.data.category
      : [];
    const products = Array.isArray(productRes?.data?.product)
      ? productRes.data.product
      : [];
    const services = Array.isArray(serviceRes?.data?.services)
      ? serviceRes.data.services
      : [];

    const hasCategoryFilter =
      Array.isArray(category_ids) && category_ids.length > 0;
    const hasProductFilter =
      Array.isArray(product_ids) && product_ids.length > 0;

    const hasServiceFilter =
      Array.isArray(service_ids) && service_ids.length > 0;

    const filteredCategories = hasCategoryFilter
      ? categories.filter((cat) =>
          category_ids.includes(Number(cat.category_id)),
        )
      : categories;

    const filteredProducts = hasProductFilter
      ? products.filter((prod) => product_ids.includes(Number(prod.product_id)))
      : products;

    const filteredServices = hasServiceFilter
      ? services.filter((srv) => service_ids.includes(Number(srv.service_id)))
      : services;

    const combinations = [];
    for (const category of filteredCategories) {
      for (const product of filteredProducts) {
        for (const service of filteredServices) {
          combinations.push({
            category_id: category.category_id,
            category_name: category.name,
            product_id: product.product_id,
            product_name: product.name,
            service_id: service.service_id,
            service_name: service.name,
          });
        }
      }
    }

    const prices = await this.priceRepository
      .createQueryBuilder('price')
      .where('price.deleted_at IS NULL')
      .getMany();

    const priceMap = new Map();
    prices.forEach((p) => {
      const key = `${p.category_id}_${p.product_id}_${p.service_id}`;
      priceMap.set(key, p.price);
    });

    const resultWithPrices = combinations.map((combo) => {
      const key = `${combo.category_id}_${combo.product_id}_${combo.service_id}`;
      const price = priceMap.has(key) ? priceMap.get(key) : null;

      return {
        ...combo,
        price,
      };
    });

    const searchedResults = search
      ? resultWithPrices.filter((r) => {
          const term = search.toLowerCase();
          return (
            r.category_name.toLowerCase().includes(term) ||
            r.product_name.toLowerCase().includes(term) ||
            r.service_name.toLowerCase().includes(term)
          );
        })
      : resultWithPrices;

    if (sort_by) {
      searchedResults.sort((a, b) => {
        const aValue = a[sort_by];
        const bValue = b[sort_by];
        if (order === 'ASC') return aValue > bValue ? 1 : -1;
        return aValue < bValue ? 1 : -1;
      });
    }

    const paginated = searchedResults.slice(skip, skip + perPage);

    return {
      statusCode: 200,
      message: 'Prices with all combinations fetched successfully.',
      data: {
        items: paginated,
        limit: perPage,
        page_number: pageNumber,
        count: searchedResults.length,
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
