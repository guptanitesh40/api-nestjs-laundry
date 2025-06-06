import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  order_id: number;

  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsOptional()
  text_note: string;

  @IsOptional()
  is_visible?: boolean;

  @IsArray()
  @IsString({ each: true })
  images?: string[] = [];
}
