import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceContent } from 'src/entities/price-content.entity';
import { PriceContentController } from './price-content.controller';
import { PriceContentService } from './price-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([PriceContent])],
  controllers: [PriceContentController],
  providers: [PriceContentService],
})
export class PriceContentModule {}
