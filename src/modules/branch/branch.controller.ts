import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-brach.dto';

@Controller('branches')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async create(@Body() createBranchDto: CreateBranchDto): Promise<Response> {
    return await this.branchService.create(createBranchDto);
  }

  @Get()
  async findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.branchService.findAll(paginationQueryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.branchService.findOne(id);
  }

  @Get('company/:company_id')
  async getBranchesByCompanyId(
    @Param('company_id') company_id: number,
  ): Promise<Response> {
    return await this.branchService.getBranchesByCompanyId(company_id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<Response> {
    return await this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response> {
    return await this.branchService.delete(id);
  }
}
