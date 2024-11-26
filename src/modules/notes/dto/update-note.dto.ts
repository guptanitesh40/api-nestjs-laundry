import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  text_note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] = [];
}
