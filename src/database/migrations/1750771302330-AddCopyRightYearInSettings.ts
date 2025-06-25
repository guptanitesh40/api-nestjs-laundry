import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCopyRightYearInSettings1750771302330
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO settings (setting_key, setting_value) 
          VALUES ('copy_rights_year', '2025')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM settings WHERE setting_key = 'copy_rights_year'`,
    );
  }
}
