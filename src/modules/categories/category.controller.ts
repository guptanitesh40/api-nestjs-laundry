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
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  @Roles(Role.CUSTOMER)
  async getAll(): Promise<Response> {
    return await this.categoryService.getAll();
  }

  @Get('admin/categories')
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return await this.categoryService.findAll(paginationQueryDto);
  }

  @Get('admin/categories/:id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.categoryService.findOne(id);
  }

  @Post('admin/categories')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Response> {
    return this.categoryService.create(createCategoryDto);
  }

  @Put('admin/categories/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('admin/categories/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.delete(id);
  }
}
