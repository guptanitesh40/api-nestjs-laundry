import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('flag-true')
  async getRolesWithFlagTrue(): Promise<any> {
    return this.roleService.getRolesWithFlagTrue();
  }
}
