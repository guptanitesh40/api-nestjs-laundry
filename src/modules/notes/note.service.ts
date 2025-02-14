import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Note } from 'src/entities/note.entity';
import { appendBaseUrlToArrayImages } from 'src/utils/image-path.helper';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    imagePaths?: string[],
  ): Promise<Response> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      images: imagePaths,
    });
    const result = await this.notesRepository.save(note);
    const Note = appendBaseUrlToArrayImages([result])[0];
    return {
      statusCode: 201,
      message: 'note added successfully',
      data: { result: Note },
    };
  }

  async findAll(): Promise<Response> {
    const note = await this.notesRepository.find({
      where: { deleted_at: null },
    });
    const Note = appendBaseUrlToArrayImages(note);

    return {
      statusCode: 200,
      message: 'notes retrived successfully',
      data: { note: Note },
    };
  }

  async findOne(note_id: number): Promise<Response> {
    const note = await this.notesRepository.findOne({
      where: { note_id, deleted_at: null },
    });
    if (!note) {
      return {
        statusCode: 404,
        message: 'note not found',
        data: null,
      };
    }
    const Note = appendBaseUrlToArrayImages([note])[0];

    return {
      statusCode: 200,
      message: 'Note retrived successfully',
      data: { note: Note },
    };
  }

  async update(
    note_id: number,
    updateNoteDto: UpdateNoteDto,
    imagePath?: string[],
  ): Promise<Response> {
    const update_note = await this.notesRepository.findOne({
      where: { note_id, deleted_at: null },
    });
    if (!update_note) {
      return {
        statusCode: 404,
        message: 'note not found',
        data: null,
      };
    }
    const updatedata = {
      ...updateNoteDto,
    };
    if (imagePath) {
      updatedata.images = imagePath;
    }

    await this.notesRepository.update(note_id, updatedata);

    Object.assign(update_note, updatedata);

    const Note = appendBaseUrlToArrayImages([update_note])[0];

    return {
      statusCode: 200,
      message: 'Note updated succssfully',
      data: { update_note: Note },
    };
  }

  async delete(note_id: number): Promise<Response> {
    const note = await this.notesRepository.findOne({
      where: { note_id, deleted_at: null },
    });
    if (!note) {
      return {
        statusCode: 404,
        message: 'note not found',
        data: null,
      };
    }

    const Note = appendBaseUrlToArrayImages([note])[0];
    note.deleted_at = new Date();
    await this.notesRepository.save(note);

    return {
      statusCode: 200,
      message: 'note deleted successfully',
      data: { note: Note },
    };
  }
}
