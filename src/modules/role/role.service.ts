import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getRolesWithFlagTrue(): Promise<Response> {
    const role = await this.roleRepository.find({ where: { flag: true } });

    return {
      statusCode: 200,
      message: 'roles retrived successfully',
      data: role,
    };
  }
}
