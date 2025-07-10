import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { CorporateService } from 'src/entities/corporate-service.entity';
import { Repository } from 'typeorm';
import { CreateCorporateServiceDto } from './dto/create-corporate-service.dto';
import { UpdateCorporateServiceDto } from './dto/update-corporate-service.dto';

@Injectable()
export class CorporateServiceService {
  constructor(
    @InjectRepository(CorporateService)
    private corporateServiceRepository: Repository<CorporateService>,
  ) {}

  async create(
    createCorporateServiceDto: CreateCorporateServiceDto,
  ): Promise<Response> {
    const service = this.corporateServiceRepository.create(
      createCorporateServiceDto,
    );
    const corporateService =
      await this.corporateServiceRepository.save(service);

    return {
      statusCode: 201,
      message: 'Corporate Service added successfully',
      data: { result: corporateService },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.corporateServiceRepository
      .createQueryBuilder('corporate-service')
      .where('corporate-service.deleted_at IS NULL');

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Corporate Services Added successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateCorporateServiceDto: UpdateCorporateServiceDto,
  ): Promise<Response> {
    const corporate_service = this.corporateServiceRepository.findOne({
      where: { corporate_service_id: id },
    });

    if (!corporate_service) {
      return {
        statusCode: 404,
        message: 'Corporate Service not found',
        data: null,
      };
    }

    await this.corporateServiceRepository.update(id, updateCorporateServiceDto);

    Object.assign(corporate_service, updateCorporateServiceDto);

    return {
      statusCode: 200,
      message: 'Corporate Service Updated Successfully',
      data: corporate_service,
    };
  }

  async delete(id: number): Promise<Response> {
    const corporate_service = await this.corporateServiceRepository.findOne({
      where: { corporate_service_id: id },
    });

    if (!corporate_service) {
      return {
        statusCode: 404,
        message: 'Corporate Service not found',
        data: null,
      };
    }

    corporate_service.deleted_at = new Date();

    await this.corporateServiceRepository.save(corporate_service);

    return {
      statusCode: 200,
      message: 'Corporate Service Deleted Successfully',
      data: corporate_service,
    };
  }
}
