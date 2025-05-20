import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Label } from 'src/entities/label.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    private dataSource: DataSource,
  ) {}

  generateLanguageCode(languageName: string): string {
    return languageName.trim().toLowerCase().replace(/\s+/g, '_');
  }

  async create(createLanguageDto: CreateLabelDto): Promise<Response> {
    createLanguageDto.label_name = this.generateLanguageCode(
      createLanguageDto.label_name,
    );

    const language = this.labelRepository.create(createLanguageDto);

    const result = await this.labelRepository.save(language);

    return {
      statusCode: 201,
      message: 'Label Added Successfully',
      data: result,
    };
  }

  async getAll(paginationQueryDto: PaginationQueryDto): Promise<any> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    let query = 'SELECT * FROM labels';
    const params: any[] = [];

    if (search) {
      query += ' WHERE label_name LIKE ?';
      params.push(`%${search}%`);
    }

    const sortBy =
      sort_by && /^[a-zA-Z0-9_]+$/.test(sort_by) ? sort_by : 'label_id';

    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    query += ' LIMIT ? OFFSET ?';
    params.push(perPage, skip);

    const result = await this.dataSource.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM labels';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' WHERE label_name LIKE ?';
      countParams.push(`%${search}%`);
    }

    const countResult = await this.dataSource.query(countQuery, countParams);

    return {
      data: result,
      page_number: pageNumber,
      per_page: perPage,
      count: Number(countResult[0]?.total) || 0,
    };
  }

  async update(labels: Array<Record<string, any>>): Promise<any> {
    const updatePromises = labels.map(async (label) => {
      const { label_id, ...fieldsToUpdate } = label;

      const columns = Object.keys(fieldsToUpdate);
      const values = Object.values(fieldsToUpdate);

      if (!label_id || columns.length === 0) {
        throw new Error('Missing ID or fields in one of the records');
      }

      const setClause = columns.map((col) => `\`${col}\` = ?`).join(', ');

      return this.dataSource.query(
        `UPDATE labels SET ${setClause} WHERE label_id = ?`,
        [...values, label_id],
      );
    });

    await Promise.all(updatePromises);

    return {
      statusCode: 200,
      message: 'Labels updated successfully',
    };
  }
}
