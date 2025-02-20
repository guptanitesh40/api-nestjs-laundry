import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorator/roles.decorator';

import { AuthGuard } from '@nestjs/passport';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { ModuleService } from './module.service';

@Controller('modules')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  async getAll(): Promise<Response> {
    return await this.moduleService.getAll();
  }
}
