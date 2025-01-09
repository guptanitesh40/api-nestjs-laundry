import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { IsPublish } from 'src/enum/is_publish.enum';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
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

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  async getAllFeedbacks(
    @Query('status') status: IsPublish,
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<Response> {
    return this.feedbackService.getAllFeedbacks(status, paginationQueryDto);
  }
}
