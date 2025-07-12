import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { LaundryHistory } from 'src/entities/laundry-history.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateLaundryHistoryDto } from './dto/create-laundry-history.dto';
import { UpdateLaundryHistoryDto } from './dto/update-laundry-history.dto';

@Injectable()
export class LaundryHistoryService {
  constructor(
    @InjectRepository(LaundryHistory)
    private laundryHistoryRepository: Repository<LaundryHistory>,
  ) {}

  async create(
    createLaundryHistoryDto: CreateLaundryHistoryDto,
    imagePath: string,
  ): Promise<Response> {
    const laundryHistory = this.laundryHistoryRepository.create({
      ...createLaundryHistoryDto,
      image: imagePath,
    });

    const result = await this.laundryHistoryRepository.save(laundryHistory);
    const LaundryHistory = appendBaseUrlToImagesOrPdf([result])[0];

    return {
      statusCode: 201,
      message: 'Laundry History added successfully',
      data: { result: LaundryHistory },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.laundryHistoryRepository
      .createQueryBuilder('laundry-history')
      .where('laundry-history.deleted_at IS NULL');

    const result = await queryBuilder.getMany();
    const laundryHistory = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Laundry History retrieved successfully',
      data: laundryHistory,
    };
  }

  async update(
    id: number,
    updateLaundryHistoryDto: UpdateLaundryHistoryDto,
    imagePath?: string,
  ): Promise<Response> {
    const laundry_history = await this.laundryHistoryRepository.findOne({
      where: { laundry_history_id: id, deleted_at: null },
    });
    if (!laundry_history) {
      return {
        statusCode: 404,
        message: 'Laundry History not found',
        data: null,
      };
    }
    const updateData = {
      ...updateLaundryHistoryDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.laundryHistoryRepository.update(id, updateData);

    Object.assign(laundry_history, updateData);

    const LaundryHistory = appendBaseUrlToImagesOrPdf([laundry_history])[0];

    return {
      statusCode: 200,
      message: 'Laundry History updated successfully',
      data: LaundryHistory,
    };
  }

  async delete(id: number): Promise<Response> {
    const laundryHistory = await this.laundryHistoryRepository.findOne({
      where: { laundry_history_id: id, deleted_at: null },
    });

    if (!laundryHistory) {
      return {
        statusCode: 404,
        message: 'Laundry History not found',
        data: null,
      };
    }

    laundryHistory.deleted_at = new Date();
    await this.laundryHistoryRepository.save(laundryHistory);

    const formattedHistoryList = appendBaseUrlToImagesOrPdf([
      laundryHistory,
    ])[0];

    return {
      statusCode: 200,
      message: 'Laundry History deleted successfully',
      data: formattedHistoryList,
    };
  }
}
