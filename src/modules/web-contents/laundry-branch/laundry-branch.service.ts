import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { LaundryBranch } from 'src/entities/laundry-branch.entity';
import { Repository } from 'typeorm';
import { CreateLaundryBranchDto } from './dto/create-laundry-branch.dto';
import { UpdateLaundryBranchDto } from './dto/update-laundry-branch.dto';

@Injectable()
export class LaundryBranchService {
  constructor(
    @InjectRepository(LaundryBranch)
    private laundryBranchRepository: Repository<LaundryBranch>,
  ) {}

  async create(
    createLaundryBranchDto: CreateLaundryBranchDto,
  ): Promise<Response> {
    const branch = this.laundryBranchRepository.create(createLaundryBranchDto);

    const result = await this.laundryBranchRepository.save(branch);

    return {
      statusCode: 201,
      message: 'Laundry Brnach added successfully',
      data: { result },
    };
  }

  async findAll(): Promise<Response> {
    const queryBuilder = this.laundryBranchRepository
      .createQueryBuilder('laundry-branch')
      .where('laundry-branch.deleted_at IS NULL');

    const result = await queryBuilder.getMany();

    return {
      statusCode: 200,
      message: 'Laundry Branch retrieved successfully',
      data: result,
    };
  }

  async update(
    id: number,
    updateLaundryBranchDto: UpdateLaundryBranchDto,
  ): Promise<Response> {
    const laundry_branch = await this.laundryBranchRepository.findOne({
      where: {
        laundry_branch_id: id,
        deleted_at: null,
      },
    });

    if (!laundry_branch) {
      return {
        statusCode: 404,
        message: 'Laundry Branch not found',
        data: null,
      };
    }

    const updateData = {
      ...updateLaundryBranchDto,
    };

    await this.laundryBranchRepository.update(id, updateData);

    Object.assign(laundry_branch, updateLaundryBranchDto);

    return {
      statusCode: 200,
      message: 'Laundry Branch updated successfully',
      data: laundry_branch,
    };
  }

  async delete(id: number): Promise<Response> {
    const laundryBranch = await this.laundryBranchRepository.findOne({
      where: { laundry_branch_id: id, deleted_at: null },
    });

    if (!laundryBranch) {
      return {
        statusCode: 404,
        message: 'laundry Branch not found',
        data: null,
      };
    }

    laundryBranch.deleted_at = new Date();
    await this.laundryBranchRepository.save(laundryBranch);

    return {
      statusCode: 200,
      message: 'Laundry Branch deleted successfully',
      data: laundryBranch,
    };
  }
}
