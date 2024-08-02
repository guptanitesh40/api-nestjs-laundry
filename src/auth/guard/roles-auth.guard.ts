import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('requiredRoles', requiredRoles);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    const user = this.jwtService.decode(token);
    return requiredRoles.some((role) => user.role === role);
  }
}
