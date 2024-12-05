import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Feedback } from 'src/entities/feedback.entity';
import { IsPublish } from 'src/enum/is_publish.enum';
import { Not, Repository } from 'typeorm';
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

  async getAllFeedbacks(): Promise<Response> {
    const approvedFeedbacks = await this.feedbackRepository.find({
      where: {
        is_publish: Not(IsPublish.NONE),
      },
    });

    return {
      statusCode: 200,
      message: 'Approved feedbacks fetch successfully',
      data: approvedFeedbacks,
    };
  }
}
