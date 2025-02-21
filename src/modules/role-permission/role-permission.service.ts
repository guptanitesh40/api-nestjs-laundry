import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Repository } from 'typeorm';
import { RolePermission } from '../../entities/role_permission.entity';
import { RolePermissionItemDto } from './dto/role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async assignPermission(
    rolePermissions: RolePermissionItemDto[],
  ): Promise<Response> {
    const createdPermissions =
      this.rolePermissionRepository.create(rolePermissions);
    const savedPermissions =
      await this.rolePermissionRepository.save(createdPermissions);

    return {
      statusCode: 201,
      message: 'Permissions assigned successfully',
      data: savedPermissions,
    };
  }

  async getPermissions(role_id: number): Promise<Response> {
    const permission = await this.rolePermissionRepository.findOne({
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

  async revokePermission(id: number): Promise<Response> {
    const permision = await this.rolePermissionRepository.findOne({
      where: { role_permission_id: id, deleted_at: null },
    });

    permision.deleted_at = new Date();

    await this.rolePermissionRepository.save(permision);

    return {
      statusCode: 200,
      message: 'Permission deleted successfully',
      data: permision,
    };
  }
}
