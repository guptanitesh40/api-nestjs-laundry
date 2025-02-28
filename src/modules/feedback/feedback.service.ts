import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Feedback } from 'src/entities/feedback.entity';
import { IsPublish } from 'src/enum/is_publish.enum';
import { Repository } from 'typeorm';
import { FeedbackFilterDto } from '../dto/feedback-filter.dto';
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

  async getApprovedFeedBacks(status: IsPublish): Promise<Response> {
    const feedbacks = this.feedbackRepository
      .createQueryBuilder('feedbacks')
      .leftJoinAndSelect('feedbacks.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .where('feedbacks.deleted_at IS NULL')
      .andWhere('feedbacks.is_publish = :status', { status })
      .select([
        'feedbacks',
        'order.user_id',
        'user.first_name',
        'user.last_name',
        'user.gender',
      ])
      .orderBy('feedbacks.updated_at', 'DESC')
      .groupBy('feedbacks.feedback_id');

    const feedback = await feedbacks.getMany();

    return {
      statusCode: 200,
      message: 'Feedbacks retrieved successfully',
      data: feedback,
    };
  }

  async approveFeedback(
    feedback_id: number,
    status: IsPublish,
  ): Promise<Response> {
    const feedbacks = await this.feedbackRepository.findOne({
      where: { feedback_id: feedback_id },
    });

    feedbacks.is_publish = status;

    await this.feedbackRepository.save(feedbacks);

    return {
      statusCode: 200,
      message: 'Feedbacks publish successfully',
    };
  }

  async getAllFeedbacks(
    status?: IsPublish,
    feedbackFilterDto?: FeedbackFilterDto,
  ): Promise<Response> {
    const {
      per_page,
      page_number,
      search,
      sort_by,
      order,
      is_publish,
      rating,
      user_id,
    } = feedbackFilterDto;

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
      feedbacksQuery.andWhere(
        '(feedbacks.rating LIKE :search OR ' +
          'feedbacks.comment LIKE :search OR ' +
          'feedbacks.is_publish LIKE :search OR ' +
          'user.first_name LIKE :search OR ' +
          'user.last_name LIKE :search OR ' +
          'user.email LIKE :search OR ' +
          'user.mobile_number LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (is_publish) {
      feedbacksQuery.andWhere(
        'feedbacks.is_publish In(:...isPublishStatuses)',
        {
          isPublishStatuses: is_publish,
        },
      );
    }

    if (rating) {
      feedbacksQuery.andWhere('feedbacks.rating In(:...feedbackRating)', {
        feedbackRating: rating,
      });
    }

    if (user_id) {
      feedbacksQuery.andWhere('order.user_id In(:...userId)', {
        userId: user_id,
      });
    }

    let sortColumn = 'feedbacks.created_at';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (sort_by) {
      sortColumn =
        sort_by === 'first_name' ||
        sort_by === 'last_name' ||
        sort_by === 'email' ||
        sort_by === 'mobile_number'
          ? `user.${sort_by}`
          : `feedbacks.${sort_by}`;
    }
    if (order) {
      sortOrder = order;
    }

    feedbacksQuery.orderBy(sortColumn, sortOrder);

    const [feedbacks, total]: any = await feedbacksQuery.getManyAndCount();

    const allFeedbacksQuery = this.feedbackRepository
      .createQueryBuilder('feedbacks')
      .select(['feedbacks.rating', 'COUNT(feedbacks.rating) AS ratingCount'])
      .groupBy('feedbacks.rating');

    const overallRating = await allFeedbacksQuery.getRawMany();

    let totalRating = 0;
    const feedbackRating = overallRating.map((feedback) => {
      feedback.ratingCount = Number(feedback.ratingCount);
      totalRating += feedback.feedbacks_rating * feedback.ratingCount;
      return feedback;
    });

    const average = totalRating / total;
    const averageRating = Number(average.toFixed(2));

    return {
      statusCode: 200,
      message: 'Approved feedbacks fetch successfully',
      data: {
        feedbacks,
        feedbackRating,
        averageRating,
        limit: perPage,
        page_number: pageNumber,
        count: total,
      },
    };
  }
}
