import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async create(@Body() createPriceDto: CreatePriceDto): Promise<Response> {
    return await this.priceService.create(createPriceDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async findAll(): Promise<Response> {
    return await this.priceService.findAll();
  }

  @Get('customer')
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CUSTOMER)
  async getAll(): Promise<any[]> {
    return await this.priceService.getAll();
  }
}
