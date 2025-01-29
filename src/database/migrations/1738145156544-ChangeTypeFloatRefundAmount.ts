import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeFloatRefundAmount1738145156544
  implements MigrationInterface
{
  name = 'ChangeTypeFloatRefundAmount1738145156544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`refund_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`refund_amount\` float NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`refund_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`refund_amount\` decimal NULL DEFAULT '0'`,
    );
  }
}
