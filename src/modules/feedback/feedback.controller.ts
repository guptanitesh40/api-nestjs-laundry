import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Response } from 'src/dto/response.dto';
import { IsPublish } from 'src/enum/is_publish.enum';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Response> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get('approved')
  async getApprovedFeedbacks(
    @Query('status') status: IsPublish,
  ): Promise<Response> {
    if (status) {
      return this.feedbackService.getFeedBacksByStatus(status);
    } else {
      return this.feedbackService.getAllFeedbacks();
    }
  }
}
