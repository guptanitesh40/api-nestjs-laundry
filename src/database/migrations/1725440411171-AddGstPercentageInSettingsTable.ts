import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGstPercentageInSettingsTable1725440411171
  implements MigrationInterface
{
  name = 'AddGstPercentageInSettingsTable1725440411171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`settings\` ADD \`gst\` float NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`settings\` DROP COLUMN \`gst\``);
  }
}
