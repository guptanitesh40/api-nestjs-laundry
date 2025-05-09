import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/dto/response.dto';
import { Setting } from 'src/entities/setting.entity';
import {
  appendBaseUrlToBannerAndPdf,
  appendWebIp,
} from 'src/utils/image-path.helper';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { ArraySettingDto, UpdateSettingDto } from './dto/update-settings.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private dataSource: DataSource,
  ) {}

  async update(arraySettingDto: ArraySettingDto): Promise<Response> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updateSettings = [];
      const newSettings = [];
      for (const setting of arraySettingDto.settings) {
        updateSettings.push({
          setting_key: setting.setting_key,
          deleted_at: new Date(),
        });

        const newString = queryRunner.manager.create(Setting, {
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
        });

        newSettings.push(newString);
      }

      await queryRunner.manager.update(
        Setting,
        {
          setting_key: In(updateSettings.map((s) => s.setting_key)),
          deleted_at: IsNull(),
        },
        { deleted_at: new Date() },
      );

      await queryRunner.manager.save(Setting, newSettings);
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

  async imageUpdate(
    updateSettingDto: UpdateSettingDto,
    imagePath: string,
  ): Promise<Response> {
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
      if (updateSettingDto.setting_key === 'home_banner_image' && imagePath) {
        updateSettingDto.setting_value = imagePath;
      }

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
      if (element.setting_key === 'home_banner_image') {
        result[element.setting_key] = appendBaseUrlToBannerAndPdf(
          element.setting_value,
        );
      }

      if (element.setting_key === 'price_pdf_url') {
        result[element.setting_key] = appendBaseUrlToBannerAndPdf(
          element.setting_value,
        );
      }

      const webIpKeys = [
        'terms-condition',
        'privacy-policy',
        'refund-policy',
        'faq',
        'contact-us',
        'about-us',
      ];

      if (webIpKeys.includes(element.setting_key)) {
        result[element.setting_key] = appendWebIp(element.setting_value);
      }
    });

    return {
      statusCode: 200,
      message: 'Settings retrieved successfully ',
      data: result,
    };
  }
}
