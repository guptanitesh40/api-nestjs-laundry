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

  async getRoles(flag?: string): Promise<Response> {
    let findRole = {};

    if (flag === 'true') {
      findRole = { flag: true };
    } else if (flag === 'false') {
      findRole = { flag: false };
    }

    const roles = await this.roleRepository.find({ where: findRole });

    return {
      statusCode: 200,
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }
}
