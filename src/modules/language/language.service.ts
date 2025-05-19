import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Language } from 'src/entities/language.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateLanguageDto } from './dto/create-language.dto';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    private dataSource: DataSource,
  ) {}

  generateLanguageCode(languageName: string): string {
    const sanitized = languageName.trim().toLowerCase().replace(/\s+/g, '_');
    return `txt_${sanitized}`;
  }

  async create(createLanguageDto: CreateLanguageDto): Promise<Response> {
    createLanguageDto.language_code = this.generateLanguageCode(
      createLanguageDto.language_name,
    );

    const language = this.languageRepository.create(createLanguageDto);

    const result = await this.languageRepository.save(language);
    const rawLanguageName = language.language_code;
    const sanitizedColumnName = rawLanguageName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    await this.dataSource.query(
      `ALTER TABLE labels ADD COLUMN \`${sanitizedColumnName}\` VARCHAR(255)`,
    );

    return {
      statusCode: 201,
      message: 'Language added successfully',
      data: result,
    };
  }

  async getAll(): Promise<Response> {
    const result = await this.languageRepository.find({});

    return {
      statusCode: 201,
      message: 'languages retrived successfully',
      data: result,
    };
  }
}
