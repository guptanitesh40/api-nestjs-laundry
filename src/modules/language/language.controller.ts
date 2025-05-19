import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'src/dto/response.dto';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { CreateLanguageDto } from './dto/create-language.dto';
import { LanguageService } from './language.service';

@Controller('language')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateLanguageDto,
  ): Promise<Response> {
    return this.languageService.create(createCategoryDto);
  }

  @Get()
  async getAll(): Promise<Response> {
    return this.languageService.getAll();
  }
}
