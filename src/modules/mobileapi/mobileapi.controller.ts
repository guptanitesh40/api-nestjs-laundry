import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { ApiService } from './api.service';

@Controller('mobile')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.CUSTOMER)
export class MobileApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('/home')
  async findAll(@Request() req): Promise<Response> {
    const user = req.user;
    return await this.apiService.findAll(user.user_id);
  }

  @Get('products')
  async getProductsByCategoryAndService(
    @Request() req,
    @Query('category_id') category_id: number,
    @Query('service_id') service_id: number,
  ): Promise<Response> {
    const user = req.user;
    return await this.apiService.getProductsByCategoryAndService(
      category_id,
      service_id,
      user.user_id,
    );
  }

  @Get('categories')
  async getCategoriesByService(
    @Query('service_id') service_id: number,
  ): Promise<Response> {
    return await this.apiService.getCategoriesByService(service_id);
  }
}
