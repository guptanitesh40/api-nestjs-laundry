import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVisibleColumnInServiceTable1747992077033
  implements MigrationInterface
{
  name = 'AddIsVisibleColumnInServiceTable1747992077033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` ADD \`is_visible\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` DROP COLUMN \`is_visible\``,
    );
  }
}
