import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { OptionalAuthGuard } from '../auth/guard/optional.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { ApiService } from './api.service';

@Controller('mobile')
export class MobileApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('/home')
  @UseGuards(OptionalAuthGuard)
  async findAll(@Request() req): Promise<Response> {
    const user = req?.user;
    return await this.apiService.findAll(user?.user_id);
  }

  @Get('products')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async getProductsByCategoryAndService(
    @Request() req,
    @Query('category_id') category_id: number,
    @Query('service_id') service_id: number,
    @Query('search') search?: string,
  ): Promise<Response> {
    const user = req.user;
    return await this.apiService.getProductsByCategoryAndService(
      category_id,
      service_id,
      user.user_id,
      search,
    );
  }

  @Get('categories')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async getCategoriesByService(
    @Query('service_id') service_id: number,
  ): Promise<Response> {
    return await this.apiService.getCategoriesByService(service_id);
  }
}
