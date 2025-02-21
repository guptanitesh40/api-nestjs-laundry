import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSION_KEY } from 'src/decorator/admin-permission.decorator';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { RolePermission } from 'src/entities/role_permission.entity';
import { Role } from 'src/enum/role.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<{
      module_id: number;
      create?: boolean;
      update?: boolean;
      read?: boolean;
      delete?: boolean;
    } | null>(ADMIN_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role_id) {
      return false;
    }

    if (user.role_id === Role.SUPER_ADMIN) {
      return true;
    }

    if (user.role_id === Role.CUSTOMER) {
      return true;
    }

    if (requiredRoles) {
      if (!requiredRoles.includes(user.role_id.toString())) {
        return false;
      }
    }

    if (requiredPermissions) {
      const hasPermission = await this.dataSource
        .getRepository(RolePermission)
        .findOneBy({
          role_id: user.role_id,
          module_id: requiredPermissions.module_id,
        });

      if (!hasPermission) {
        return false;
      }

      if (
        (requiredPermissions.create && !hasPermission.create) ||
        (requiredPermissions.update && !hasPermission.update) ||
        (requiredPermissions.read && !hasPermission.read) ||
        (requiredPermissions.delete && !hasPermission.delete)
      ) {
        return false;
      }
    }

    return true;
  }
}
