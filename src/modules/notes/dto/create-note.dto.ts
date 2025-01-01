import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  order_id: number;

  @IsOptional()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  text_note: string;

  @IsArray()
  @IsString({ each: true })
  images?: string[] = [];
}
