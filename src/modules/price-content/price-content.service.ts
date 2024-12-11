import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { PriceContent } from 'src/entities/price-content.entity';
import { Repository } from 'typeorm';
import { CreatePriceContentDto } from './dto/create-price-content.dto';
import { UpdatePriceContentDto } from './dto/update-price-content.dto';

@Injectable()
export class PriceContentService {
  constructor(
    @InjectRepository(PriceContent)
    private readonly priceContentRepository: Repository<PriceContent>,
  ) {}

  async create(
    createPriceContentDto: CreatePriceContentDto,
  ): Promise<Response> {
    const category = this.priceContentRepository.create(createPriceContentDto);
    const result = await this.priceContentRepository.save(category);

    return {
      statusCode: 201,
      message: 'category added successfully',
      data: result,
    };
  }

  async findAll(): Promise<Response> {
    const result = await this.priceContentRepository.find();

    return {
      statusCode: 200,
      message: 'category service retrived',
      data: result,
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });
    if (!result) {
      throw new NotFoundException(`CategoryService with ID ${id} not found`);
    }
    return {
      statusCode: 200,
      message: 'category serice retrived ',
      data: result,
    };
  }

  async update(
    id: number,
    updatePriceContentDto: UpdatePriceContentDto,
  ): Promise<Response> {
    const category = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });

    if (!category) {
      throw new NotFoundException(`CategoryService not found`);
    }

    await this.priceContentRepository.update(id, updatePriceContentDto);

    const category_service = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'category service updated successfully',
      data: category_service,
    };
  }

  async delete(id: number): Promise<Response> {
    const category = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });
    if (!category) {
      throw new NotFoundException('category service not found');
    }
    category.deleted_at = new Date();
    await this.priceContentRepository.save(category);

    return {
      statusCode: 200,
      message: 'category service deleted successfully',
      data: category,
    };
  }
}
