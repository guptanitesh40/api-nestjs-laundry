import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user || user?.role_id === undefined) {
        return false;
      }
      return requiredRoles.includes(user.role_id);
    } catch (e) {
      throw e;
    }
  }
}
