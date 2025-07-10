import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateServiceController } from './corporate-service.controller';
import { CorporateServiceService } from './corporate-service.service';
import { CorporateService } from 'src/entities/corporate-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CorporateService])],
  controllers: [CorporateServiceController],
  providers: [CorporateServiceService],
})
export class CorporateServiceModule {}
