import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from 'src/entities/price.entity';
import { CategoryModule } from '../categories/category.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { ProductModule } from '../products/product.module';
import { ServicesModule } from '../services/services.module';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Price]),
    forwardRef(() => InvoiceModule),
    CategoryModule,
    ProductModule,
    ServicesModule,
  ],
  providers: [PriceService],
  controllers: [PriceController],
  exports: [PriceService],
})
export class PriceModule {}
