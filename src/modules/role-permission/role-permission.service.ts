import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RolePermission } from '../../entities/role_permission.entity';
import { RolePermissionItemDto } from './dto/role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private dataSource: DataSource,
  ) {}

  async assignPermission(
    rolePermissions: RolePermissionItemDto[],
  ): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        RolePermission,
        { deleted_at: IsNull() },
        { deleted_at: new Date() },
      );

      const createdPermissions = queryRunner.manager.create(
        RolePermission,
        rolePermissions,
      );
      const savedPermissions =
        await queryRunner.manager.save(createdPermissions);

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: 'Permissions assigned successfully',
        data: savedPermissions,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(): Promise<Response> {
    const role = await this.rolePermissionRepository.find({
      where: { deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'roles permission retrived successfully',
      data: role,
    };
  }

  async getPermissions(role_id: number): Promise<Response> {
    const permission = await this.rolePermissionRepository.find({
      where: {
        role_id: role_id,
        deleted_at: null,
      },
    });

    return {
      statusCode: 200,
      message: 'role permission retrived successfully',
      data: permission,
    };
  }
}
