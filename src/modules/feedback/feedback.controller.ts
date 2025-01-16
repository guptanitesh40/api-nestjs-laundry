import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { IsPublish } from 'src/enum/is_publish.enum';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { FeedbackFilterDto } from '../dto/feedback-filter.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @Roles(Role.CUSTOMER)
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
    }
  }

  @Patch('approved/:feedback_id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async approveFeedback(
    @Param('feedback_id') feedback_id: number,
    @Body('status') status: number,
  ): Promise<Response> {
    return await this.feedbackService.approveFeedback(feedback_id, status);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getAllFeedbacks(
    @Query('status') status: IsPublish,
    @Query() feedbackFilterDto: FeedbackFilterDto,
  ): Promise<Response> {
    return this.feedbackService.getAllFeedbacks(status, feedbackFilterDto);
  }
}
