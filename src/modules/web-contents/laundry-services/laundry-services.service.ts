import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { LaundryService } from 'src/entities/laundry-services.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateLaundryListDto } from './dto/create-laundry-services.dto';
import { UpdateLaundryServicesDto } from './dto/update-laundry-services';

@Injectable()
export class LaundryServicesService {
  constructor(
    @InjectRepository(LaundryService)
    private laundryServicesRepository: Repository<LaundryService>,
  ) {}

  async create(
    createLaundryListDto: CreateLaundryListDto,
    imagePath: string,
  ): Promise<Response> {
    const laundryServices = this.laundryServicesRepository.create({
      ...createLaundryListDto,
      image: imagePath,
    });

    const result = await this.laundryServicesRepository.save(laundryServices);
    const LaundryService = appendBaseUrlToImagesOrPdf([result])[0];

    return {
      statusCode: 201,
      message: 'Laundry Service added successfully',
      data: { result: LaundryService },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.laundryServicesRepository
      .createQueryBuilder('laundry-services')
      .where('laundry-services.deleted_at IS NULL');

    const result = await queryBuilder.getMany();
    const laundryService = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Laundry Service retrieved successfully',
      data: laundryService,
    };
  }

  async update(
    id: number,
    updateLaundryServicesDto: UpdateLaundryServicesDto,
    imagePath?: string,
  ): Promise<Response> {
    const laundry_service = await this.laundryServicesRepository.findOne({
      where: { laundry_service_id: id, deleted_at: null },
    });
    if (!laundry_service) {
      return {
        statusCode: 404,
        message: 'Laundry Service not found',
        data: null,
      };
    }
    const updateData = {
      ...updateLaundryServicesDto,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await this.laundryServicesRepository.update(id, updateData);

    Object.assign(laundry_service, updateData);

    const LaundryService = appendBaseUrlToImagesOrPdf([laundry_service])[0];

    return {
      statusCode: 200,
      message: 'Laundry Service updated successfully',
      data: LaundryService,
    };
  }

  async delete(id: number): Promise<Response> {
    const serviceList = await this.laundryServicesRepository.findOne({
      where: { laundry_service_id: id, deleted_at: null },
    });

    if (!serviceList) {
      return {
        statusCode: 404,
        message: 'Laundry Service not found',
        data: null,
      };
    }

    serviceList.deleted_at = new Date();
    await this.laundryServicesRepository.save(serviceList);

    const formattedServiceList = appendBaseUrlToImagesOrPdf([serviceList])[0];

    return {
      statusCode: 200,
      message: 'Laundry Service deleted successfully',
      data: formattedServiceList,
    };
  }
}
