import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKasarAmountColumnOrdersTable1725279821307
  implements MigrationInterface
{
  name = 'AddKasarAmountColumnOrdersTable1725279821307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`kasar_amount\` decimal NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`kasar_amount\``,
    );
  }
}
