import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Modules } from 'src/entities/modules.entity';
import { Repository } from 'typeorm';

export class ModuleService {
  constructor(
    @InjectRepository(Modules)
    private moduleRepository: Repository<Modules>,
  ) {}

  async getAll(): Promise<Response> {
    const module = await this.moduleRepository.find({
      where: { deleted_at: null },
    });

    return {
      statusCode: 201,
      message: 'Modules retrived successfully',
      data: module,
    };
  }
}
