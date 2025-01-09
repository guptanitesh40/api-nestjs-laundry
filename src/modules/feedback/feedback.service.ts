import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Feedback } from 'src/entities/feedback.entity';
import { IsPublish } from 'src/enum/is_publish.enum';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Response> {
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { order_id: createFeedbackDto.order_id },
    });
    if (existingFeedback) {
      throw new BadRequestException('Feedback already exists for this order');
    }

    const feedback = this.feedbackRepository.create(createFeedbackDto);
    const result = await this.feedbackRepository.save(feedback);

    return {
      statusCode: 200,
      message: 'Feedback added successfully',
      data: result,
    };
  }

  async getFeedBacksByStatus(status: IsPublish): Promise<Response> {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        is_publish: status,
      },
    });

    return {
      statusCode: 200,
      message: 'Feedbacks retrived successfully',
      data: feedbacks,
    };
  }

  async getAllFeedbacks(
    status?: IsPublish,
    paginationQueryDto?: PaginationQueryDto,
  ): Promise<Response> {
    const { per_page, page_number, search, sort_by, order } =
      paginationQueryDto;

    const pageNumber = page_number ?? 1;
    const perPage = per_page ?? 10;
    const skip = (pageNumber - 1) * perPage;

    const feedbacksQuery = this.feedbackRepository
      .createQueryBuilder('feedbacks')
      .leftJoinAndSelect('feedbacks.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .where('feedbacks.deleted_at IS NULL')
      .select([
        'feedbacks',
        'order.user_id',
        'user.first_name',
        'user.last_name',
        'user.mobile_number',
        'user.email',
      ])
      .take(perPage)
      .skip(skip);

    if (status) {
      feedbacksQuery.andWhere('feedbacks.is_publish= :status', { status });
    }

    if (search) {
      feedbacksQuery.andWhere('feedbacks.rating LIKE :search', {
        search: `%${search}%`,
      });
    }

    let sortColumn = 'feedbacks.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn = sort_by;
    }
    if (order) {
      sortOrder = order;
    }

    feedbacksQuery.orderBy(sortColumn, sortOrder);

    const [feedbacks, total] = await feedbacksQuery.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Approved feedbacks fetch successfully',
      data: {
        feedbacks,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }
}
