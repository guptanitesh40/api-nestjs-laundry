import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Setting } from 'src/entities/setting.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-settings.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private dataSource: DataSource,
  ) {}
  async update(updateSettingDto: UpdateSettingDto): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        Setting,
        {
          setting_key: updateSettingDto.setting_key,
          deleted_at: IsNull(),
        },
        { deleted_at: new Date() },
      );

      await queryRunner.manager.save(Setting, updateSettingDto);

      await queryRunner.commitTransaction();

      return {
        statusCode: 200,
        message: 'Settings updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(keys?: string[]): Promise<Response> {
    const query = this.settingRepository
      .createQueryBuilder('setting')
      .where('setting.deleted_at IS NULL');

    if (keys && keys.length > 0) {
      query.andWhere('setting.setting_key IN (:...keys)', { keys });
    }

    const setting = await query.getMany();

    const result = {};
    setting.map((element) => {
      result[element.setting_key] = element.setting_value;
    });

    return {
      statusCode: 200,
      message: 'settings retrieved successfully ',
      data: result,
    };
  }
}
