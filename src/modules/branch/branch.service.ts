import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Branch } from 'src/entities/branch.entity';
import { Repository } from 'typeorm';
import { BranchFilterDto } from '../dto/branch-filter.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-brach.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Response> {
    const branch = this.branchRepository.create(createBranchDto);
    const result = await this.branchRepository.save(branch);

    return {
      statusCode: 201,
      message: 'Branch added successfully',
      data: { result },
    };
  }

  async findAll(branchFilterDto: BranchFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      company_name,
      branch_manager,
    } = branchFilterDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.branchManager', 'user')
      .leftJoinAndSelect('branch.company', 'company')
      .where('branch.deleted_at IS NULL')
      .select([
        'branch',
        'company.company_name',
        'user.first_name',
        'user.last_name',
      ])
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        `(branch.branch_name LIKE :search 
            OR branch.branch_address LIKE :search 
            OR user.first_name LIKE :search 
            OR user.last_name LIKE :search 
            OR branch.branch_email LIKE :search 
            OR branch.branch_registration_number LIKE :search 
            OR company.company_name LIKE :search 
            OR CONCAT(user.first_name, ' ', user.last_name) LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (company_name) {
      queryBuilder.andWhere('company.company_name In (:...companyName)', {
        companyName: company_name,
      });
    }

    if (branch_manager) {
      queryBuilder.andWhere(
        `CONCAT(user.first_name, ' ', user.last_name) In (:...branchManager)`,
        { branchManager: branch_manager },
      );
    }

    let sortColumn = 'branch.created_at';
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
      message: 'Branches retrieved successfully',
      data: { result, limit: per_page, page_number: pageNumber, count: total },
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.branchRepository
      .createQueryBuilder('branch')
      .where('branch.branch_id = :id', { id })
      .andWhere('branch.deleted_at IS NULL')
      .leftJoinAndSelect('branch.branchManager', 'user')
      .leftJoinAndSelect('branch.company', 'company')
      .where('branch.deleted_at IS NULL')
      .select([
        'branch',
        'company.company_name',
        'user.first_name',
        'user.last_name',
      ])
      .getOne();

    if (!result) {
      return {
        statusCode: 404,
        message: 'Branch not found',
        data: null,
      };
    }
    return {
      statusCode: 200,
      message: 'Branch retrieved successfully',
      data: { result },
    };
  }

  async getBranchesByCompanyId(company_id: number): Promise<Response> {
    const result = await this.branchRepository.find({
      where: { company_id: company_id, deleted_at: null },
    });
    if (!result) {
      return {
        statusCode: 404,
        message: 'Branch not found',
        data: null,
      };
    }
    return {
      statusCode: 200,
      message: 'Branch retrived successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateBranchDto: UpdateBranchDto,
  ): Promise<Response> {
    const branch = await this.branchRepository.findOne({
      where: { branch_id: id, deleted_at: null },
    });
    if (!branch) {
      return {
        statusCode: 404,
        message: 'Branch not found',
        data: null,
      };
    }

    await this.branchRepository.update(id, updateBranchDto);
    const updatedBranch = await this.branchRepository.findOne({
      where: { branch_id: id },
    });

    return {
      statusCode: 200,
      message: 'Branch updated successfully',
      data: { updatedBranch },
    };
  }

  async delete(id: number): Promise<Response> {
    const branch = await this.branchRepository.findOne({
      where: { branch_id: id, deleted_at: null },
    });
    if (!branch) {
      return {
        statusCode: 404,
        message: 'Branch not found',
        data: null,
      };
    }

    branch.deleted_at = new Date();
    await this.branchRepository.save(branch);
    return {
      statusCode: 200,
      message: 'Branch deleted successfully',
      data: { branch },
    };
  }
}
