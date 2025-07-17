import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomePage } from 'src/entities/home-page.entity';
import { HomePageService } from './home-page.service';
import { HomePageController } from './home.page.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HomePage])],
  controllers: [HomePageController],
  providers: [HomePageService],
})
export class HomePageModule {}
