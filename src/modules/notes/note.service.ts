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
    const isVisible =
      String(createNoteDto.is_visible) === 'true' ? true : false;

    if (createNoteDto.is_visible) {
      createNoteDto.is_visible = isVisible;
    }
    const note = this.notesRepository.create({
      ...createNoteDto,
      images: imagePaths,
      is_visible: isVisible,
    });

    const result = await this.notesRepository.save(note);

    const Note = appendBaseUrlToArrayImages([result])[0];
    return {
      statusCode: 201,
      message: 'Note added successfully',
      data: { result: Note },
    };
  }

  async findAll(): Promise<Response> {
    const note = await this.notesRepository.find({
      where: { deleted_at: null },
      order: { created_at: 'DESC' },
    });
    const Note = appendBaseUrlToArrayImages(note);

    return {
      statusCode: 200,
      message: 'Notes retrived successfully',
      data: { note: Note },
    };
  }

  async getVisibleNote(order_id: number): Promise<Response> {
    const note = await this.notesRepository.find({
      where: { order_id, deleted_at: null, is_visible: true },
    });
    if (!note) {
      return {
        statusCode: 404,
        message: 'Note not found',
        data: null,
      };
    }
    const notes = appendBaseUrlToArrayImages(note);

    return {
      statusCode: 200,
      message: 'Note retrived successfully',
      data: notes,
    };
  }

  async findOne(note_id: number): Promise<Response> {
    const note = await this.notesRepository.findOne({
      where: { note_id, deleted_at: null },
    });
    if (!note) {
      return {
        statusCode: 404,
        message: 'Note not found',
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
  ): Promise<Response> {
    const update_note = await this.notesRepository.findOne({
      where: { note_id, deleted_at: null },
    });
    if (!update_note) {
      return {
        statusCode: 404,
        message: 'Note not found',
        data: null,
      };
    }

    const updatedata = {
      ...updateNoteDto,
    };

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
        message: 'Note not found',
        data: null,
      };
    }

    const Note = appendBaseUrlToArrayImages([note])[0];
    note.deleted_at = new Date();
    await this.notesRepository.save(note);

    return {
      statusCode: 200,
      message: 'Note deleted successfully',
      data: { note: Note },
    };
  }
}
