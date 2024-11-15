import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { Role } from 'src/enum/role.enum';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Response> {
    const workshop = this.workshopRepository.create(createWorkshopDto);
    const result = await this.workshopRepository.save(workshop);

    const workshopMappings = [];
    const userIds = [];

    if (createWorkshopDto.user_ids && createWorkshopDto.user_ids.length > 0) {
      const users = await this.userService.findUsersByIds(
        createWorkshopDto.user_ids,
      );

      for (const user of users) {
        if (user.role_id === Role.WORKSHOP_MANAGER) {
          workshopMappings.push(
            this.workshopManagerRepository.create({
              workshop_id: result.workshop_id,
              user_id: user.user_id,
            }),
          );
          userIds.push(user.user_id);
        }
      }
    }

    if (workshopMappings.length > 0) {
      await this.workshopManagerRepository.save(workshopMappings);
    }

    return {
      statusCode: 201,
      message: 'Workshop added Successfully',
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
      .leftJoinAndSelect('workshopManagerMapping.user', 'user')
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
        'user.first_name',
        'user.last_name',
      ])
      .getMany();

    return {
      statusCode: 200,
      message: 'Workshops retrieved successfully',
      data: { workshops },
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.workshopRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect(
        'workshop.workshopManagerMappings',
        'workshopManagerMapping',
      )
      .leftJoinAndSelect('workshopManagerMapping.user', 'user')
      .where('workshop.workshop_id = :id', { id })
      .andWhere('workshop.deleted_at IS NULL')
      .select([
        'workshop',
        'workshopManagerMapping.user_id',
        'user.first_name',
        'user.last_name',
      ])
      .getOne();

    if (!result) {
      throw new NotFoundException('Workshop not found');
    }

    return {
      statusCode: 200,
      message: 'Workshop Retrieved successfully',
      data: { result },
    };
  }

  async update(
    id: number,
    updateWorkshopDto: UpdateWorkshopDto,
  ): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const workshop = await queryRunner.manager.findOne(Workshop, {
        where: { workshop_id: id, deleted_at: null },
      });

      if (!workshop) {
        await queryRunner.rollbackTransaction();
        return {
          statusCode: 404,
          message: 'Workshop not found',
          data: null,
        };
      }

      const { user_ids, ...workshopFieldsToUpdate } = updateWorkshopDto;

      let workshopMappings = [];
      if (updateWorkshopDto.user_ids) {
        await queryRunner.manager.delete(WorkshopManagerMapping, {
          workshop_id: id,
        });

        const users = await this.userService.findUsersByIds(user_ids);

        for (const user of users) {
          if (user.role_id === Role.WORKSHOP_MANAGER) {
            workshopMappings.push(
              queryRunner.manager.create(WorkshopManagerMapping, {
                workshop_id: workshop.workshop_id,
                user_id: user.user_id,
              }),
            );
          }
        }
      } else {
        workshopMappings = await queryRunner.manager.find(
          WorkshopManagerMapping,
          {
            where: { workshop_id: workshop.workshop_id },
            select: ['user_id'],
          },
        );
      }

      if (workshopMappings.length > 0) {
        await queryRunner.manager.save(
          WorkshopManagerMapping,
          workshopMappings,
        );
      }
      await queryRunner.manager.update(Workshop, id, workshopFieldsToUpdate);

      await queryRunner.commitTransaction();

      return {
        statusCode: 200,
        message: 'Workshop updated successfully',
        data: { workshop, workshopMappings },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
