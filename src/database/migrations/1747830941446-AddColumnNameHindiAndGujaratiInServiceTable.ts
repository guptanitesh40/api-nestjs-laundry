import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNameHindiAndGujaratiInServiceTable1747830941446
  implements MigrationInterface
{
  name = 'AddColumnNameHindiAndGujaratiInServiceTable1747830941446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` ADD \`name_hindi\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` ADD \`name_gujarati\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` DROP COLUMN \`name_gujarati\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`services\` DROP COLUMN \`name_hindi\``,
    );
  }
}
