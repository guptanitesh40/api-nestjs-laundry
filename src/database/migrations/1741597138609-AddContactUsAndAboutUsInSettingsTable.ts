import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactUsAndAboutUsInSettingsTable1741597138609
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO settings (setting_key, setting_value)
      VALUES 
        ('contact-us', '/contact'),
        ('about-us', '/about')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM settings 
      WHERE setting_key IN ('contact-us', 'about-us')
    `);
  }
}
