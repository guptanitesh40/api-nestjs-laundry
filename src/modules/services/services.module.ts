import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Price } from 'src/entities/price.entity';
import { Product } from 'src/entities/product.entity';
import { Service } from 'src/entities/service.entity';
import { PriceService } from '../price/price.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Price, Category, Product])],
  providers: [ServicesService, PriceService],
  controllers: [ServicesController],
})
export class ServicesModule {}
