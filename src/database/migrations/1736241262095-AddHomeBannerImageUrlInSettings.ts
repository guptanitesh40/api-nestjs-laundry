import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHomeBannerImageUrlInSettings1736241262095
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO settings (setting_key, setting_value) 
        VALUES ('home_banner_image', 'images/banner/1736139426341.png')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM settings WHERE setting_key = 'home_banner_image'`,
    );
  }
}
