import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelManagement } from 'src/entities/label-management.entity';
import { LabelManagementService } from './label-management.service';
import { LabelManagementController } from './label-managment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabelManagement])],
  controllers: [LabelManagementController],
  providers: [LabelManagementService],
})
export class LabelManagementModule {}
