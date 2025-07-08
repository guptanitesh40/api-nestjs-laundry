import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceList } from 'src/entities/service-list.entity';
import { ServiceListController } from './service-list.controller';
import { ServiceListService } from './service.list.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceList])],
  controllers: [ServiceListController],
  providers: [ServiceListService],
})
export class ServiceListModule {}
