import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { UsersModule } from '../user/user.module';
import { WorkshopController } from './workshop.controller';
import { WorkshopService } from './workshop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workshop, WorkshopManagerMapping]),
    UsersModule,
  ],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}
