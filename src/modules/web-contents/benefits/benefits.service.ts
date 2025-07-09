import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Benefit } from 'src/entities/benefit.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateBenefitDto } from './dto/create.benefits.dto';
import { UpdateBenefitDto } from './dto/update.benefits.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private benefitRepository: Repository<Benefit>,
  ) {}

  async create(
    createBenefitDto: CreateBenefitDto,
    imagePath: string,
  ): Promise<Response> {
    const benefit = this.benefitRepository.create({
      ...createBenefitDto,
      image: imagePath,
    });

    const result = await this.benefitRepository.save(benefit);
    const Banefit = appendBaseUrlToImagesOrPdf([result])[0];
    return {
      statusCode: 201,
      message: 'Benefit added successfully',
      data: { result: Banefit },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.benefitRepository
      .createQueryBuilder('benefits')
      .where('benefits.deleted_at IS NULL');

    const result = await queryBuilder.getMany();
    const Benefit = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Benefits retrieved successfully',
      data: Benefit,
    };
  }

  async update(
    id: number,
    updateBenefitDto: UpdateBenefitDto,
    imagePath?: string,
  ): Promise<Response> {
    const benefit = await this.benefitRepository.findOne({
      where: { benefit_id: id, deleted_at: null },
    });
    if (!benefit) {
      return {
        statusCode: 404,
        message: 'Benefits Service-list not found',
        data: null,
      };
    }
    const updateData = {
      ...updateBenefitDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.benefitRepository.update(id, updateData);

    Object.assign(benefit, updateData);

    const Benefit = appendBaseUrlToImagesOrPdf([benefit])[0];

    return {
      statusCode: 200,
      message: 'Benefit updated successfully',
      data: Benefit,
    };
  }

  async delete(id: number): Promise<Response> {
    const benefit = await this.benefitRepository.findOne({
      where: { benefit_id: id, deleted_at: null },
    });

    if (!benefit) {
      return {
        statusCode: 404,
        message: 'Benefit not found',
        data: null,
      };
    }

    benefit.deleted_at = new Date();
    await this.benefitRepository.save(benefit);

    const formattedBenefit = appendBaseUrlToImagesOrPdf([benefit])[0];

    return {
      statusCode: 200,
      message: 'Benefit deleted successfully',
      data: formattedBenefit,
    };
  }
}
