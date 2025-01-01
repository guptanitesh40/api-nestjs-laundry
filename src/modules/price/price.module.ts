import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { InvoiceModule } from '../invoice/invoice.module';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Price, Category, Product, Service]),
    forwardRef(() => InvoiceModule),
  ],
  providers: [PriceService],
  controllers: [PriceController],
  exports: [PriceService],
})
export class PriceModule {}
