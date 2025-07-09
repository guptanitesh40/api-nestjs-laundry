import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from 'src/entities/benefit.entity';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';

@Module({
  imports: [TypeOrmModule.forFeature([Benefit])],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitModule {}
