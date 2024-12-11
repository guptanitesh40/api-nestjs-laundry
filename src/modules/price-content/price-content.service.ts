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
    const priceContent = this.priceContentRepository.create(
      createPriceContentDto,
    );
    const result = await this.priceContentRepository.save(priceContent);

    return {
      statusCode: 201,
      message: 'price content added successfully',
      data: result,
    };
  }

  async findAll(): Promise<Response> {
    const result = await this.priceContentRepository.find();

    return {
      statusCode: 200,
      message: 'price content retrived successfully',
      data: result,
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });
    if (!result) {
      throw new NotFoundException(`price content with ID ${id} not found`);
    }
    return {
      statusCode: 200,
      message: 'price content retrived ',
      data: result,
    };
  }

  async update(
    id: number,
    updatePriceContentDto: UpdatePriceContentDto,
  ): Promise<Response> {
    const priceContent = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });

    if (!priceContent) {
      throw new NotFoundException(`price content not found`);
    }

    await this.priceContentRepository.update(id, updatePriceContentDto);

    const price_content = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'price content updated successfully',
      data: price_content,
    };
  }

  async delete(id: number): Promise<Response> {
    const priceContent = await this.priceContentRepository.findOne({
      where: { price_content_id: id, deleted_at: null },
    });
    if (!priceContent) {
      throw new NotFoundException('price content not found');
    }
    priceContent.deleted_at = new Date();
    await this.priceContentRepository.save(priceContent);

    return {
      statusCode: 200,
      message: 'price content deleted successfully',
      data: priceContent,
    };
  }
}
