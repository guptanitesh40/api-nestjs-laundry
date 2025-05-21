import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNameHindiAndGujaratiInProductTable1747830799678
  implements MigrationInterface
{
  name = 'AddColumnNameHindiAndGujaratiInProductTable1747830799678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`name_hindi\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`name_gujarati\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP COLUMN \`name_gujarati\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP COLUMN \`name_hindi\``,
    );
  }
}
