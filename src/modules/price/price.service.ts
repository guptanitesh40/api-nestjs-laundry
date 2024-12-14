import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ejs from 'ejs';
import * as fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { Response } from 'src/dto/response.dto';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { appendBaseUrlToImages } from 'src/utils/image-path.helper';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CreatePriceDto } from './dto/create-price.dto';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,

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
      const pdfBuffer = await this.generatePriceListPDF();
      const fileName = 'priceList.pdf';
      const filePath = path.join(process.cwd(), 'pdf', fileName);
      fs.writeFileSync(filePath, pdfBuffer);

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
    const prices = await this.priceRepository
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
        image: appendBaseUrlToImages([{ image: price.product.image }])[0].image,
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

  async generatePriceListPDF(): Promise<Buffer> {
    const base_url = process.env.BASE_URL;

    const prices = await this.getAll();
    // console.log(prices);
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/price-list-template.ejs',
    );

    const templateFile = fs.readFileSync(templatePath, 'utf8');

    const data = {
      logoUrl: `${base_url}/images/logo/logo.png`,
      prices,
    };

    const htmlContent = ejs.render(templateFile, data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
