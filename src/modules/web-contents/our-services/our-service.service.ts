import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { OurService } from 'src/entities/our-service.entity';
import { Repository } from 'typeorm';
import { CreateOurServiceDto } from './dto/create-our-service.dto';
import { UpdateOurServiceDto } from './dto/update-our-service.dto';

@Injectable()
export class OurServiceService {
  constructor(
    @InjectRepository(OurService)
    private ourServiceRepository: Repository<OurService>,
  ) {}

  async create(createOurServiceDto: CreateOurServiceDto): Promise<Response> {
    const service = this.ourServiceRepository.create(createOurServiceDto);
    const ourService = await this.ourServiceRepository.save(service);

    return {
      statusCode: 201,
      message: 'Our Service added successfully',
      data: { result: ourService },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.ourServiceRepository
      .createQueryBuilder('our-service')
      .where('our-service.deleted_at IS NULL');

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Our Services Retrived successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateOurServiceDto: UpdateOurServiceDto,
  ): Promise<Response> {
    const our_service = this.ourServiceRepository.findOne({
      where: { our_service_id: id },
    });

    if (!our_service) {
      return {
        statusCode: 404,
        message: 'Our Service not found',
        data: null,
      };
    }

    await this.ourServiceRepository.update(id, updateOurServiceDto);

    Object.assign(our_service, updateOurServiceDto);

    return {
      statusCode: 200,
      message: 'Our Service Updated Successfully',
      data: our_service,
    };
  }

  async delete(id: number): Promise<Response> {
    const our_service = await this.ourServiceRepository.findOne({
      where: { our_service_id: id },
    });

    if (!our_service) {
      return {
        statusCode: 404,
        message: 'Our Service not found',
        data: null,
      };
    }

    our_service.deleted_at = new Date();

    await this.ourServiceRepository.save(our_service);

    return {
      statusCode: 200,
      message: 'Our Service Deleted Successfully',
      data: our_service,
    };
  }
}
