import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FilesInterceptor('images', 10, fileUpload(FilePath.NOTE_IMAGES)),
  )
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Response> {
    const imagePaths = files.map(
      (file) => `${FilePath.NOTE_IMAGES}/${file.filename}`,
    );
    return await this.notesService.create(createNoteDto, imagePaths);
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
  @UseInterceptors(
    FilesInterceptor('images', 10, fileUpload(FilePath.NOTE_IMAGES)),
  )
  async update(
    @Param('id') id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Response> {
    const imagePaths = files.map(
      (file) => `${FilePath.NOTE_IMAGES}/${file.filename}`,
    );
    return await this.notesService.update(id, updateNoteDto, imagePaths);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Response> {
    return await this.notesService.delete(id);
  }
}
