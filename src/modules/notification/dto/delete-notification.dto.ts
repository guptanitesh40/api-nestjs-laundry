import { IsArray, IsNumber } from 'class-validator';

export class DeleteNotificationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  notification_id: number[];
}
