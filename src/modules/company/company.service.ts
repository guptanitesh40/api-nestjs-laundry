import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Company } from 'src/entities/company.entity';
import { appendBaseUrlToLogo } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    logoPath: string,
    contractDocumentPath: string,
  ): Promise<Response> {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      logo: logoPath,
      contract_document: contractDocumentPath,
    });

    const result = await this.companyRepository.save(company);

    const companyWithLogoUrl = appendBaseUrlToLogo([result])[0];

    return {
      statusCode: 201,
      message: 'Company added successfully',
      data: { result: companyWithLogoUrl },
    };
  }

  async findAll(paginationQueryDto: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .where('company.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(company.company_name LIKE :search OR company.registration_number LIKE :search OR company.address LIKE :search OR company.city LIKE :search OR company.state LIKE :search OR company.phone_number LIKE :search OR company.mobile_number LIKE :search OR company.email LIKE :search OR company.website LIKE :search OR company.company_owner_name LIKE:search)',
        { search: `%${search}%` },
      );
    }
    let sortColumn = 'company.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    const companiesWithBaseUrl = appendBaseUrlToLogo(result);

    return {
      statusCode: 200,
      message: 'Companies retrieved successfully',
      data: {
        result: companiesWithBaseUrl,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }

  async findOne(id: number): Promise<Response> {
    const result = await this.companyRepository.findOne({
      where: { company_id: id, deleted_at: null },
    });

    const Company = appendBaseUrlToLogo([result])[0];
    return {
      statusCode: 200,
      message: 'company retrieved successfully',
      data: { result: Company },
    };
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
    logoPath?: string,
  ): Promise<Response> {
    const company = await this.companyRepository.findOne({
      where: { company_id: id, deleted_at: null },
    });

    if (!company) {
      return {
        statusCode: 404,
        message: 'company not found',
        data: null,
      };
    }

    const updateData = {
      ...updateCompanyDto,
    };

    if (logoPath) {
      updateData.logo = logoPath;
    }

    await this.companyRepository.update(id, updateData);

    const update_company = await this.companyRepository.findOne({
      where: { company_id: id, deleted_at: null },
    });

    const Company = appendBaseUrlToLogo([update_company])[0];

    return {
      statusCode: 200,
      message: 'Company updated successfully',
      data: { update_company: Company },
    };
  }

  async delete(id: number): Promise<Response> {
    const company = await this.companyRepository.findOne({
      where: { company_id: id, deleted_at: null },
    });
    if (!company) {
      return {
        statusCode: 404,
        message: 'company not found',
        data: null,
      };
    }

    const Company = appendBaseUrlToLogo([company])[0];

    company.deleted_at = new Date();
    await this.companyRepository.save(company);

    return {
      statusCode: 200,
      message: 'company deleted successfully',
      data: { company: Company },
    };
  }
}
