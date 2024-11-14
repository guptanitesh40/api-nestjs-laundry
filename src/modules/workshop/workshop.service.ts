import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { Role } from 'src/enum/role.enum';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
    @InjectRepository(WorkshopManagerMapping)
    private workshopManagerRepository: Repository<WorkshopManagerMapping>,
    private readonly userService: UserService,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Response> {
    const workshop = this.workshopRepository.create(createWorkshopDto);
    const result = await this.workshopRepository.save(workshop);

    const workshopMappings = [];
    const userIds = [];

    if (createWorkshopDto.user_ids) {
      for (const userId of createWorkshopDto.user_ids) {
        const user = await this.userService.findUserById(userId);

        if (user && user.role_id === Role.WORKSHOP_MANAGER) {
          workshopMappings.push(
            this.workshopManagerRepository.create({
              workshop_id: result.workshop_id,
              user_id: userId,
            }),
          );
          userIds.push(userId);
        }
      }
    }

    if (workshopMappings.length > 0) {
      await this.workshopManagerRepository.save(workshopMappings);
    }

    return {
      statusCode: 201,
      message: 'Category added Successfully',
      data: { result, user_ids: userIds },
    };
  }

  async findAll(): Promise<Response> {
    const workshops = await this.workshopRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect(
        'workshop.workshopManagerMappings',
        'workshopManagerMapping',
      )
      .where('workshop.deleted_at IS NULL')
      .select([
        'workshop.workshop_id',
        'workshop.workshop_name',
        'workshop.email',
        'workshop.address',
        'workshop.mobile_number',
        'workshop.created_at',
        'workshop.updated_at',
        'workshopManagerMapping.user_id',
      ])
      .getMany();

    const formattedWorkshops = workshops.map((workshop) => {
      const userIds = workshop.workshopManagerMappings.map(
        (mapping) => mapping.user_id,
      );
      return {
        ...workshop,
        user_ids: userIds,
      };
    });

    return {
      statusCode: 200,
      message: 'Workshops retrieved successfully',
      data: { workshops: formattedWorkshops },
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.workshopRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect(
        'workshop.workshopManagerMappings',
        'workshopManagerMapping',
      )
      .where('workshop.workshop_id = :id', { id })
      .andWhere('workshop.deleted_at IS NULL')
      .select(['workshop', 'workshopManagerMapping.user_id'])
      .getOne();

    if (!result) {
      throw new NotFoundException('Workshop not found');
    }

    const mapped = {
      ...result,
      user_ids: result.workshopManagerMappings.map(
        (mapping) => mapping.user_id,
      ),
    };

    return {
      statusCode: 200,
      message: 'Workshop Retrieved successfully',
      data: { result: mapped },
    };
  }

  async update(
    id: number,
    updateWorkshopDto: UpdateWorkshopDto,
  ): Promise<Response> {
    const workshop = await this.workshopRepository.findOne({
      where: { workshop_id: id, deleted_at: null },
    });

    if (!workshop) {
      return {
        statusCode: 404,
        message: 'Workshop not found',
        data: null,
      };
    }

    const { user_ids, ...workshopFieldsToUpdate } = updateWorkshopDto;
    await this.workshopRepository.update(id, workshopFieldsToUpdate);

    let workshopMappings = [];
    const userIds = [];

    if (user_ids) {
      await this.workshopManagerRepository.delete({ workshop_id: id });

      for (const userId of user_ids) {
        const user = await this.userService.findUserById(userId);

        if (user && user.role_id === Role.WORKSHOP_MANAGER) {
          workshopMappings.push(
            this.workshopManagerRepository.create({
              workshop_id: workshop.workshop_id,
              user_id: userId,
            }),
          );
          userIds.push(userId);
        }
      }
    } else {
      workshopMappings = await this.workshopManagerRepository.find({
        where: { workshop_id: workshop.workshop_id },
        select: ['user_id'],
      });
      userIds.push(...workshopMappings.map((mapping) => mapping.user_id));
    }

    if (workshopMappings.length > 0) {
      await this.workshopManagerRepository.save(workshopMappings);
    }

    const updatedWorkshop = await this.workshopRepository.findOne({
      where: { workshop_id: id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'Workshop updated successfully',
      data: { updatedWorkshop, userIds },
    };
  }

  async delete(id: number): Promise<Response> {
    const workshop = await this.workshopRepository.findOne({
      where: {
        workshop_id: id,
        deleted_at: null,
      },
    });

    if (!workshop) {
      return {
        statusCode: 404,
        message: 'Workshop not found',
        data: null,
      };
    }
    workshop.deleted_at = new Date();
    await this.workshopRepository.save(workshop);

    return {
      statusCode: 200,
      message: 'Workshop deleted successfully',
      data: workshop,
    };
  }
}
