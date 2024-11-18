import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { WorkshopService } from './workshop.service';

@Controller('workshops')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  async create(
    @Body() createWorkshopDto: CreateWorkshopDto,
  ): Promise<Response> {
    return this.workshopService.create(createWorkshopDto);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.workshopService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.workshopService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return await this.workshopService.update(id, updateWorkshopDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.workshopService.delete(id);
  }
}
