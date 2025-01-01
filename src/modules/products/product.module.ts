import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { InvoiceModule } from '../invoice/invoice.module';
import { PriceService } from '../price/price.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Price, Category, Service]),
    forwardRef(() => InvoiceModule),
  ],
  providers: [ProductService, PriceService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
