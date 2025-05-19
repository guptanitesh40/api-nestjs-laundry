import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Label } from 'src/entities/label.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private labelManagementRepository: Repository<Label>,
    private dataSource: DataSource,
  ) {}

  generateLanguageCode(languageName: string): string {
    return languageName.trim().toLowerCase().replace(/\s+/g, '_');
  }

  async create(createLanguageDto: CreateLabelDto): Promise<Response> {
    createLanguageDto.label_name = this.generateLanguageCode(
      createLanguageDto.label_name,
    );

    const language = this.labelManagementRepository.create(createLanguageDto);

    const result = await this.labelManagementRepository.save(language);

    return {
      statusCode: 201,
      message: 'Label Added Successfully',
      data: result,
    };
  }

  async getAll(): Promise<any> {
    const result = await this.dataSource.query('SELECT * FROM labels');
    return result;
  }

  async update(labels: Array<Record<string, any>>): Promise<any> {
    const updatePromises = labels.map(async (label) => {
      const { label_managment_id, ...fieldsToUpdate } = label;

      const columns = Object.keys(fieldsToUpdate);
      const values = Object.values(fieldsToUpdate);

      if (!label_managment_id || columns.length === 0) {
        throw new Error('Missing ID or fields in one of the records');
      }

      const setClause = columns.map((col) => `\`${col}\` = ?`).join(', ');

      return this.dataSource.query(
        `UPDATE label_management SET ${setClause} WHERE label_management_id = ?`,
        [...values, label_managment_id],
      );
    });

    await Promise.all(updatePromises);

    return {
      statusCode: 200,
      message: 'Labels updated successfully',
    };
  }
}
