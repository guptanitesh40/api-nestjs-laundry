import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from 'src/entities/modules.entity';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';

@Module({
  imports: [TypeOrmModule.forFeature([Modules])],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModulesModule {}
