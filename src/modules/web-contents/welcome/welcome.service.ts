import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Welcome } from 'src/entities/welcome.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateWelcomeDto } from './dto/create-welcome.dto';
import { UpdateWelcomeDto } from './dto/update-welcome.dto';

@Injectable()
export class WelcomeService {
  constructor(
    @InjectRepository(Welcome)
    private welcomeRepo: Repository<Welcome>,
  ) {}

  async create(
    createWelcomeDto: CreateWelcomeDto,
    imagePath: string,
  ): Promise<Response> {
    const welcome = this.welcomeRepo.create({
      ...createWelcomeDto,
      image: imagePath,
    });

    const result = await this.welcomeRepo.save(welcome);

    const Welcome = appendBaseUrlToImagesOrPdf([result])[0];

    return {
      statusCode: 201,
      message: 'Welcome added successfully',
      data: { result: Welcome },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.welcomeRepo
      .createQueryBuilder('welcome')
      .where('welcome.deleted_at IS NULL');

    const result = await queryBuilder.getOne();

    const welcome = appendBaseUrlToImagesOrPdf([result]);

    return {
      statusCode: 200,
      message: 'Welcome retrieved successfully',
      data: welcome,
    };
  }

  async update(
    id: number,
    updateWelcomeDto: UpdateWelcomeDto,
    imagePath?: string,
  ): Promise<Response> {
    const welcome = await this.welcomeRepo.findOne({
      where: {
        welcome_id: id,
        deleted_at: null,
      },
    });

    if (!welcome) {
      return {
        statusCode: 404,
        message: 'Welcome not found',
        data: null,
      };
    }

    const updateData = {
      ...updateWelcomeDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.welcomeRepo.update(id, updateData);

    Object.assign(welcome, updateWelcomeDto);

    const Welcome = appendBaseUrlToImagesOrPdf([welcome])[0];

    return {
      statusCode: 200,
      message: 'Welcome updated successfully',
      data: Welcome,
    };
  }

  async delete(id: number): Promise<Response> {
    const welcome = await this.welcomeRepo.findOne({
      where: { welcome_id: id, deleted_at: null },
    });

    if (!welcome) {
      return {
        statusCode: 404,
        message: 'Welcome not found',
        data: null,
      };
    }

    welcome.deleted_at = new Date();
    await this.welcomeRepo.save(welcome);

    return {
      statusCode: 200,
      message: 'Welcome deleted successfully',
      data: welcome,
    };
  }
}
