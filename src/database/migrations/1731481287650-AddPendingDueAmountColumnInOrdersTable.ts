import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingDueAmountColumnInOrdersTable1731481287650
  implements MigrationInterface
{
  name = 'AddPendingDueAmountColumnInOrdersTable1731481287650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`pending_due_amount\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`pending_due_amount\``,
    );
  }
}
