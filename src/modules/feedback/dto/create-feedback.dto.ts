import { IsNumber, IsOptional } from 'class-validator';
import { IsPublish } from 'src/enum/is_publish.enum';

export class CreateFeedbackDto {
  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsOptional()
  comment?: string;

  @IsOptional()
  order_id?: number;

  @IsOptional()
  is_publish?: IsPublish;
}
