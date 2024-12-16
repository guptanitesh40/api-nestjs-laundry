import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { UpdateSettingDto } from './dto/update-settings.dto';
import { SettingService } from './setting.service';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Put('admin/settings')
  async update(@Body() updateSettingDto: UpdateSettingDto): Promise<Response> {
    return await this.settingService.update(updateSettingDto);
  }

  @Get('admin/settings')
  async findAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }

  @Get('settings')
  @Roles(Role.CUSTOMER)
  async getAll(@Query('keys') keys?: string[]): Promise<Response> {
    return await this.settingService.findAll(keys);
  }
}
