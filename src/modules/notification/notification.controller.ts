import {
  Body,
  Controller,
  Delete,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from '../auth/guard/role.guard';
import { DeleteNotificationDto } from './dto/delete-notification.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(Role.CUSTOMER)
  async getAll(@Request() req): Promise<Response> {
    const user = req.user;
    return await this.notificationService.getAll(user.user_id);
  }

  @Delete()
  @Roles(Role.CUSTOMER)
  async delete(
    @Body() deleteNotificationDto: DeleteNotificationDto,
    @Request() req,
  ): Promise<Response> {
    const user = req.user;
    return await this.notificationService.delete(
      deleteNotificationDto.notification_id,
      user.user_id,
    );
  }
}
