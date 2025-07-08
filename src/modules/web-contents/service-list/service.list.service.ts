import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { ServiceList } from 'src/entities/service-list.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateServiceListDto } from './dto/create-service-list.dto';
import { UpdateServiceListDto } from './dto/update.service-list.dto';

@Injectable()
export class ServiceListService {
  constructor(
    @InjectRepository(ServiceList)
    private serviceListRepository: Repository<ServiceList>,
  ) {}

  async create(
    createServiceListDto: CreateServiceListDto,
    imagePath: string,
  ): Promise<Response> {
    const banner = this.serviceListRepository.create({
      ...createServiceListDto,
      image: imagePath,
    });

    const result = await this.serviceListRepository.save(banner);
    const Banner = appendBaseUrlToImagesOrPdf([result])[0];
    return {
      statusCode: 201,
      message: 'Service-list added successfully',
      data: { result: Banner },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.serviceListRepository
      .createQueryBuilder('service-list')
      .where('service-list.deleted_at IS NULL');

    const result = await queryBuilder.getMany();
    const serviceList = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Service-list retrieved successfully',
      data: serviceList,
    };
  }

  async update(
    id: number,
    updateServiceListDto: UpdateServiceListDto,
    imagePath?: string,
  ): Promise<Response> {
    const update_service_list = await this.serviceListRepository.findOne({
      where: { service_list_id: id, deleted_at: null },
    });
    if (!update_service_list) {
      return {
        statusCode: 404,
        message: 'Service-list not found',
        data: null,
      };
    }
    const updateData = {
      ...updateServiceListDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.serviceListRepository.update(id, updateData);

    Object.assign(update_service_list, updateData);

    const Banner = appendBaseUrlToImagesOrPdf([update_service_list])[0];

    return {
      statusCode: 200,
      message: 'Service updated successfully',
      data: { update_banner: Banner },
    };
  }
}
