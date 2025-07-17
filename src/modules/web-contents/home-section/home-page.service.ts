import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { HomePage } from 'src/entities/home-page.entity';
import { Repository } from 'typeorm';
import { CreateHomePageDto } from './dto/create-home-page.dto';
import { UpdateHomePageDto } from './dto/update-home-page.dto';

@Injectable()
export class HomePageService {
  constructor(
    @InjectRepository(HomePage)
    private homeRepository: Repository<HomePage>,
  ) {}

  async create(createHomePageDto: CreateHomePageDto): Promise<Response> {
    const data = this.homeRepository.create(createHomePageDto);
    const result = await this.homeRepository.save(data);

    return {
      statusCode: 201,
      message: 'Home page title created Successfully',
      data: result,
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.homeRepository
      .createQueryBuilder('home-page')
      .where('home-page.deleted_at IS NULL');

    const result = await queryBuilder.getOne();

    return {
      statusCode: 200,
      message: 'Home page Retrived successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateHomePageDto: UpdateHomePageDto,
  ): Promise<Response> {
    const homePage = await this.homeRepository.findOne({
      where: { home_page_id: id, deleted_at: null },
    });
    if (!homePage) {
      return {
        statusCode: 404,
        message: 'About Us not found',
        data: null,
      };
    }
    const updateData = {
      ...updateHomePageDto,
    };

    await this.homeRepository.update(id, updateData);

    Object.assign(homePage, updateData);

    return {
      statusCode: 200,
      message: 'Home Page updated successfully',
      data: homePage,
    };
  }
}
