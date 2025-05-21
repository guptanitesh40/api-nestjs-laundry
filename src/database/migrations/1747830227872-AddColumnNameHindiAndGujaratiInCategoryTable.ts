import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNameHindiAndGujaratiInCategoryTable1747830227872
  implements MigrationInterface
{
  name = 'AddColumnNameHindiAndGujaratiInCategoryTable1747830227872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD \`name_hindi\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD \`name_gujarati\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP COLUMN \`name_gujarati\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP COLUMN \`name_hindi\``,
    );
  }
}
