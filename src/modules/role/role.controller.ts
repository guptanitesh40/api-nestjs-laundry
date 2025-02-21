import { Controller, Get, Query } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getRoles(@Query('flag') flag?: string): Promise<Response> {
    return this.roleService.getRoles(flag);
  }
}
