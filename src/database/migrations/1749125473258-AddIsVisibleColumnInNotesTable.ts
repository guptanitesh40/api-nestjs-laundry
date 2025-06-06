import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVisibleColumnInNotesTable1749125473258
  implements MigrationInterface
{
  name = 'AddIsVisibleColumnInNotesTable1749125473258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD \`is_visible\` tinyint NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`is_visible\``);
  }
}
