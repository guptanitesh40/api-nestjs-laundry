import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminPermission } from 'src/decorator/admin-permission.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  @Roles(Role.CUSTOMER)
  async getAll(): Promise<Response> {
    return await this.categoryService.getAll();
  }

  @Get('admin/categories')
  @AdminPermission(5, { read: true })
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return await this.categoryService.findAll(paginationQueryDto);
  }

  @Get('admin/categories/:id')
  @AdminPermission(5, { read: true })
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.categoryService.findOne(id);
  }

  @Post('admin/categories')
  @AdminPermission(5, { create: true })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Response> {
    return this.categoryService.create(createCategoryDto);
  }

  @Put('admin/categories/:id')
  @AdminPermission(5, { update: true })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('admin/categories/:id')
  @AdminPermission(5, { delete: true })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.delete(id);
  }
}
