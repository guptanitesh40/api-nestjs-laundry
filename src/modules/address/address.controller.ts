import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-addresses.dto';
import { UpdateUserAddressDto } from './dto/update-address.dto';

@Controller('address')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class AddressController {
  constructor(private readonly userAddressService: AddressService) {}

  @Get()
  @Roles(Role.CUSTOMER)
  async getAll(@Request() req): Promise<Response> {
    const user = req.user;
    return this.userAddressService.getAll(user.user_id);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER)
  async findOne(@Request() req, @Param('id') id: number): Promise<Response> {
    const user = req.user;
    return this.userAddressService.findOne(user.user_id, id);
  }

  @Get(':user_id/user')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getOne(@Param('user_id') user_id: number): Promise<Response> {
    return this.userAddressService.getAll(user_id);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  async create(
    @Request() req,
    @Body() userAddress: CreateAddressDto,
  ): Promise<Response> {
    const user = req.user;
    return this.userAddressService.create(user.user_id, userAddress);
  }

  @Post('admin')
  @Roles(Role.SUPER_ADMIN)
  async createAdminAddress(
    @Body() userAddress: CreateAddressDto,
  ): Promise<Response> {
    return this.userAddressService.createAdminAddress(userAddress);
  }

  @Put(':id')
  @Roles(Role.CUSTOMER)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateAddressDto: UpdateUserAddressDto,
  ): Promise<Response> {
    const user = req.user;

    return this.userAddressService.update(user.user_id, id, updateAddressDto);
  }

  @Delete(':id')
  @Roles(Role.CUSTOMER)
  async delete(@Request() req, @Param('id') id: number): Promise<Response> {
    const user = req.user;
    return this.userAddressService.delete(user.user_id, id);
  }
}
