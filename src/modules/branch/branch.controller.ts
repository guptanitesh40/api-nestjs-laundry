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
import { BranchFilterDto } from '../dto/branch-filter.dto';
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

  @Get('companies')
  async getBranchesByCompanyIds(
    @Query('company_ids') company_ids: number | number[],
  ): Promise<Response> {
    return await this.branchService.getBranchesByCompanyIds(company_ids);
  }

  @Get()
  async findAll(@Query() branchFilterDto: BranchFilterDto) {
    return this.branchService.findAll(branchFilterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.branchService.findOne(id);
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
