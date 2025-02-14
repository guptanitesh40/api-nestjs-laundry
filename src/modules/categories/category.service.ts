import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAll(): Promise<Response> {
    const category = await this.categoryRepository.find({
      where: { deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'Category retrived successfully',
      data: { category },
    };
  }

  async findAll(paginationQueryDto: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere('category.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    let sortColumn = 'category.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.categoryRepository.findOne({
      where: { category_id: id, deleted_at: null },
    });

    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return {
      statusCode: 200,
      message: 'Category retrieved successfully',
      data: { result },
    };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Response> {
    const category = this.categoryRepository.create(createCategoryDto);
    const result = await this.categoryRepository.save(category);

    return {
      statusCode: 201,
      message: 'category added successfully',
      data: { result },
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Response> {
    const update_category = await this.categoryRepository.findOne({
      where: { category_id: id, deleted_at: null },
    });

    if (!update_category) {
      return {
        statusCode: 404,
        message: 'category not found',
        data: null,
      };
    }
    await this.categoryRepository.update(id, updateCategoryDto);

    Object.assign(update_category, updateCategoryDto);

    return {
      statusCode: 200,
      message: 'Category updated successfully',
      data: { update_category },
    };
  }

  async delete(id: number): Promise<Response> {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id, deleted_at: null },
    });
    if (!category) {
      return {
        statusCode: 404,
        message: 'Category not found',
        data: null,
      };
    }
    category.deleted_at = new Date();
    await this.categoryRepository.save(category);

    return {
      statusCode: 200,
      message: 'Category deleted successfully',
      data: category,
    };
  }
}
