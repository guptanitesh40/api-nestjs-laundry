import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { WhyChooseUs } from 'src/entities/why-choose-us.entity';
import { Repository } from 'typeorm';
import { CreateWhyChooseUsDto } from './dto/create-why-choose-us.dto';
import { UpdateWhyChooseUsDto } from './dto/update-why-choose-us.dto';

@Injectable()
export class WhyChooseUsService {
  constructor(
    @InjectRepository(WhyChooseUs)
    private readonly whyChooseUsRepository: Repository<WhyChooseUs>,
  ) {}

  async create(createWhyChooseUsDto: CreateWhyChooseUsDto): Promise<Response> {
    const item = this.whyChooseUsRepository.create(createWhyChooseUsDto);

    const result = await this.whyChooseUsRepository.save(item);

    return {
      statusCode: 201,
      message: 'Category added successfully',
      data: { result },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.whyChooseUsRepository
      .createQueryBuilder('why-choose-us')
      .where('why-choose-us.deleted_at IS NULL');

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Why-choose-us retrieved successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateWhyChooseUsDto: UpdateWhyChooseUsDto,
  ): Promise<Response> {
    const why_choose_us = await this.whyChooseUsRepository.findOne({
      where: {
        why_choose_us_id: id,
        deleted_at: null,
      },
    });

    if (!why_choose_us) {
      return {
        statusCode: 404,
        message: 'Why-choose-us not found',
        data: null,
      };
    }

    const updateData = {
      ...updateWhyChooseUsDto,
    };

    await this.whyChooseUsRepository.update(id, updateData);

    Object.assign(why_choose_us, updateWhyChooseUsDto);

    return {
      statusCode: 200,
      message: 'Why-choose-us updated successfully',
      data: why_choose_us,
    };
  }

  async delete(id: number): Promise<Response> {
    const whyChooseUs = await this.whyChooseUsRepository.findOne({
      where: { why_choose_us_id: id, deleted_at: null },
    });

    if (!whyChooseUs) {
      return {
        statusCode: 404,
        message: 'WhyChooseUS not found',
        data: null,
      };
    }

    whyChooseUs.deleted_at = new Date();
    await this.whyChooseUsRepository.save(whyChooseUs);

    return {
      statusCode: 200,
      message: 'WhyChooseUS deleted successfully',
      data: whyChooseUs,
    };
  }
}
