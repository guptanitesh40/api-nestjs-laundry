import { Body, Controller, Post } from '@nestjs/common';
import { CreateHomePageDto } from './dto/create-home-page.dto';
import { HomePageService } from './home-page.service';

@Controller('home-sections')
export class HomePageController {
  constructor(private readonly homePageService: HomePageService) {}

  @Post('upsert')
  async upsert(@Body() dto: CreateHomePageDto) {
    return await this.homePageService.create(dto);
  }
}
