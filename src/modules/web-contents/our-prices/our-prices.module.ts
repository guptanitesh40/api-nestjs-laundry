import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OurPrice } from 'src/entities/our-price.entity';
import { OurPriceController } from './our-prices.controller';
import { OurPriceService } from './our-prices.service';

@Module({
  imports: [TypeOrmModule.forFeature([OurPrice])],
  controllers: [OurPriceController],
  providers: [OurPriceService],
})
export class OurPriceModule {}
