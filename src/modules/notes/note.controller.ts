import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilePath } from 'src/constants/FilePath';
import { Roles } from 'src/decorator/roles.decorator';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/enum/role.enum';
import { fileUpload } from 'src/multer/image-upload';
import { RolesGuard } from '../auth/guard/role.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './note.service';

@Controller('notes')
@UseGuards(RolesGuard)
@UseGuards(AuthGuard('jwt'))
@Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', fileUpload(FilePath.NOTE_IMAGES)))
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    if (!file) {
      throw new HttpException('File nust be provide ', HttpStatus.BAD_REQUEST);
    }

    const imagePath = FilePath.NOTE_IMAGES + '/' + file.filename;
    return await this.notesService.create(createNoteDto, imagePath);
  }

  @Get()
  async findAll(): Promise<Response> {
    return await this.notesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response> {
    return await this.notesService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', fileUpload(FilePath.NOTE_IMAGES)))
  async update(
    @Param('id') id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const imagePath = file ? FilePath.NOTE_IMAGES + '/' + file.filename : null;
    return await this.notesService.update(id, updateNoteDto, imagePath);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Response> {
    return await this.notesService.delete(id);
  }
}
