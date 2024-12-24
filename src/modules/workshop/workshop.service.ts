import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { WorkshopManagerMapping } from 'src/entities/workshop-manager-mapping.entity';
import { Workshop } from 'src/entities/workshop.entity';
import { Role } from 'src/enum/role.enum';
import { DataSource, In, Repository } from 'typeorm';
import { WorkshopFilterDto } from '../dto/workshop-filter.dto';
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

  async findAll(workshopFilterDto: WorkshopFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      workshop_manager_ids,
    } = workshopFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const workshopQuery = this.workshopRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect(
        'workshop.workshopManagerMappings',
        'workshopManagerMapping',
      )
      .leftJoinAndSelect('workshopManagerMapping.user', 'user')
      .where('workshop.deleted_at IS NULL')
      .select(['workshop', 'workshopManagerMapping.user_id'])
      .take(perPage)
      .skip(skip);

    if (search) {
      workshopQuery.andWhere(
        '(workshop.workshop_name LIKE :search OR ' +
          'workshop.address LIKE :search OR ' +
          'workshop.email LIKE :search OR ' +
          'workshop.mobile_number LIKE :search OR ' +
          `CONCAT(user.first_name, ' ' ,user.last_name) LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (workshop_manager_ids) {
      workshopQuery.andWhere('user.user_id In (:...userIds)', {
        userIds: workshop_manager_ids,
      });
    }

    let sortColumn = 'workshop.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = `workshop.${sort_by}`;
    }

    if (order) {
      sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    workshopQuery.orderBy(sortColumn, sortOrder);

    const [workshops, total] = await workshopQuery.getManyAndCount();

    const workshopIds = workshops.map((workshop) => workshop.workshop_id);

    const workshopManagerMappings = await this.workshopManagerRepository.find({
      where: { workshop_id: In(workshopIds) },
      relations: ['user'],
      select: ['workshop_id', 'user_id', 'user'],
    });

    const workshopManagerMap = new Map<
      number,
      { user_id: number; full_name: string }[]
    >();

    workshopManagerMappings.forEach((mapping) => {
      const fullName = `${mapping.user.first_name} ${mapping.user.last_name}`;
      if (!workshopManagerMap.has(mapping.workshop_id)) {
        workshopManagerMap.set(mapping.workshop_id, []);
      }
      workshopManagerMap.get(mapping.workshop_id)?.push({
        user_id: mapping.user_id,
        full_name: fullName,
      });
    });

    const workshopsWithMappings = workshops.map((workshop) => ({
      ...workshop,
      workshop_managers: workshopManagerMap.get(workshop.workshop_id) || [],
    }));

    return {
      statusCode: 200,
      message: 'Workshops retrieved successfully',
      data: {
        workshops: workshopsWithMappings,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
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
      .addSelect("CONCAT(user.first_name, ' ', user.last_name)", 'full_name')
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
