import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { ContactUs } from 'src/entities/contact-us.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  async createContact(
    createContactUsDto: CreateContactUsDto,
  ): Promise<Response> {
    const contact = this.contactUsRepository.create(createContactUsDto);
    const result = await this.contactUsRepository.save(contact);

    return {
      statusCode: 201,
      message: 'Your message has been sent successfully',
      data: result,
    };
  }

  async getAll(paginationQueryDto: PaginationQueryDto): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;

    const perPage = per_page ?? 10;

    const skip = (pageNumber - 1) * perPage;

    const queryBuilder = this.contactUsRepository
      .createQueryBuilder('contact-us')
      .where('contact-us.deleted_at IS NULL')
      .take(perPage)
      .skip(skip);

    if (search) {
      queryBuilder.andWhere(
        '(contact-us.full_name LIKE :search OR ' +
          'contact-us.email LIKE :search OR ' +
          'contact-us.mobile_number LIKE :search OR ' +
          'contact-us.message LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let sortColumn = 'contact-us.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = `contact-us.${sort_by}`;
    }
    if (order) {
      sortOrder = order;
    }

    queryBuilder.orderBy(sortColumn, sortOrder);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Contact-us retrieved successfully',
      data: { result, limit: perPage, page_number: pageNumber, count: total },
    };
  }
}
