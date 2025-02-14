import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Branch } from 'src/entities/branch.entity';
import { In, Repository } from 'typeorm';
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

  async getBranchList(): Promise<Response> {
    const queryBuilder = this.branchRepository
      .createQueryBuilder('branch')
      .andWhere('branch.deleted_at IS NULL')
      .select(['branch.branch_id', 'branch.branch_name']);

    const branches = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Branches retrived successfully',
      data: branches,
    };
  }

  async findAll(branchFilterDto: BranchFilterDto): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      company_id,
      branch_manager_ids,
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
        'user.user_id',
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

    if (company_id) {
      queryBuilder.andWhere('company.company_id In (:...companyIds)', {
        companyIds: company_id,
      });
    }

    if (branch_manager_ids) {
      queryBuilder.andWhere('user.user_id In (:...userIds)', {
        userIds: branch_manager_ids,
      });
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

  async getBranchesByCompanyIds(
    company_ids: number | number[],
  ): Promise<Response> {
    const idsArray = Array.isArray(company_ids) ? company_ids : [company_ids];

    const result = await this.branchRepository.find({
      where: {
        company_id: In(idsArray),
        deleted_at: null,
      },
    });

    return {
      statusCode: 200,
      message: 'Branches retrieved successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateBranchDto: UpdateBranchDto,
  ): Promise<Response> {
    const updatedBranch = await this.branchRepository.findOne({
      where: { branch_id: id, deleted_at: null },
    });
    if (!updatedBranch) {
      return {
        statusCode: 404,
        message: 'Branch not found',
        data: null,
      };
    }

    await this.branchRepository.update(id, updateBranchDto);

    Object.assign(updatedBranch, updateBranchDto);

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
