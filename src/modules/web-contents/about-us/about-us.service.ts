import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { AboutUs } from 'src/entities/about-us.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateAboutUsDto } from './dto/create-about-us.dto';
import { UpdateAboutUs } from './dto/update-about-us.dto';

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private readonly aboutUsRepository: Repository<AboutUs>,
  ) {}

  async create(dto: CreateAboutUsDto): Promise<AboutUs> {
    const aboutUs = this.aboutUsRepository.create(dto);
    return await this.aboutUsRepository.save(aboutUs);
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.aboutUsRepository
      .createQueryBuilder('about-us')
      .where('about-us.deleted_at IS NULL');

    const result = await queryBuilder.getOne();

    return {
      statusCode: 200,
      message: 'About us Retrived successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateAboutUs: UpdateAboutUs,
    imagePath?: string,
  ): Promise<Response> {
    const aboutUs = await this.aboutUsRepository.findOne({
      where: { about_us_id: id, deleted_at: null },
    });
    if (!aboutUs) {
      return {
        statusCode: 404,
        message: 'About Us not found',
        data: null,
      };
    }
    const updateData = {
      ...updateAboutUs,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.aboutUsRepository.update(id, updateData);

    Object.assign(aboutUs, updateData);

    const LaundryService = appendBaseUrlToImagesOrPdf([aboutUs])[0];

    return {
      statusCode: 200,
      message: 'About us updated successfully',
      data: LaundryService,
    };
  }

  async delete(id: number): Promise<Response> {
    const aboutUs = await this.aboutUsRepository.findOne({
      where: { about_us_id: id, deleted_at: null },
    });

    if (!aboutUs) {
      return {
        statusCode: 404,
        message: 'About Us not found',
        data: null,
      };
    }

    aboutUs.deleted_at = new Date();
    await this.aboutUsRepository.save(aboutUs);

    const formattedAboutUs = appendBaseUrlToImagesOrPdf([aboutUs])[0];

    return {
      statusCode: 200,
      message: 'About us deleted successfully',
      data: formattedAboutUs,
    };
  }
}
