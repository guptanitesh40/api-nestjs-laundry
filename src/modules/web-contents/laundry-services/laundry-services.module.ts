import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaundryService } from 'src/entities/laundry-services.entity';
import { LaundryServicesController } from './laundry-services.controller';
import { LaundryServicesService } from './laundry-services.service';

@Module({
  imports: [TypeOrmModule.forFeature([LaundryService])],
  controllers: [LaundryServicesController],
  providers: [LaundryServicesService],
})
export class LaundryServicesModule {}
