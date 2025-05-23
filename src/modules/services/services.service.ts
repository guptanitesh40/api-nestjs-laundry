import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Service } from 'src/entities/service.entity';
import { appendBaseUrlToImagesOrPdf } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async getAll(): Promise<Response> {
    const services = await this.serviceRepository.find({
      where: { deleted_at: null, is_visible: true },
    });

    const service = appendBaseUrlToImagesOrPdf(services);
    return {
      statusCode: 200,
      message: 'Services retrieved successfully',
      data: { services: service },
    };
  }

  async findAll(paginationQueryDto: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .where('service.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere('(service.name LIKE :search)', {
        search: `%${search}%`,
      });
    }

    let sortColumn = 'service.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    const services = appendBaseUrlToImagesOrPdf(result);

    return {
      statusCode: 200,
      message: 'Services retrieved successfully',
      data: { services, limit: perPage, page_number: pageNumber, count: total },
    };
  }

  async findOne(id: number): Promise<Response> {
    const service = await this.serviceRepository.findOne({
      where: { service_id: id, deleted_at: null },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const services = appendBaseUrlToImagesOrPdf([service])[0];

    return {
      statusCode: 200,
      message: 'Service retrieved successfully',
      data: { service: services },
    };
  }

  async create(
    createServiceDto: CreateServiceDto,
    imagePath: string,
  ): Promise<Response> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      image: imagePath,
    });

    const result = await this.serviceRepository.save(service);

    const services = appendBaseUrlToImagesOrPdf([result])[0];

    return {
      statusCode: 201,
      message: 'Service added successfully',
      data: { result: services },
    };
  }

  async update(
    id: number,
    updateServicetDto: UpdateServiceDto,
    imagePath?: string,
  ): Promise<Response> {
    const update_service = await this.serviceRepository.findOne({
      where: { service_id: id, deleted_at: null },
    });
    if (!update_service) {
      return {
        statusCode: 404,
        message: 'Service not found',
        data: null,
      };
    }
    const updatedata = {
      ...updateServicetDto,
    };
    if (imagePath) {
      updatedata.image = imagePath;
    }
    await this.serviceRepository.update(id, updatedata);

    Object.assign(update_service, updatedata);

    const services = appendBaseUrlToImagesOrPdf([update_service])[0];

    return {
      statusCode: 200,
      message: 'Service updated successfully',
      data: { update_service: services },
    };
  }

  async delete(id: number): Promise<Response> {
    const service = await this.serviceRepository.findOne({
      where: { service_id: id, deleted_at: null },
    });
    if (!service) {
      return {
        statusCode: 404,

        message: 'Service not found',
        data: null,
      };
    }

    const services = appendBaseUrlToImagesOrPdf([service])[0];

    service.deleted_at = new Date();
    await this.serviceRepository.save(service);

    return {
      statusCode: 200,
      message: 'Service deleted successfully',
      data: { service: services },
    };
  }
}
