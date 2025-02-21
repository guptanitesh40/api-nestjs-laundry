import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { RolePermissionDto } from './dto/role-permission.dto';
import { RolePermissionService } from './role-permission.service';

@Controller('role-permission')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post('assign')
  async assignPermission(
    @Body() rolePermissionDto: RolePermissionDto,
  ): Promise<Response> {
    return this.rolePermissionService.assignPermission(rolePermissionDto);
  }

  @Get('list')
  async getPermissions(@Query('role_id') role_id: number) {
    return this.rolePermissionService.getPermissions(role_id);
  }

  @Delete(':id')
  async revokePermission(@Param('id') id: number) {
    return this.rolePermissionService.revokePermission(id);
  }
}
