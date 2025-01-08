import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnInRazorPayTransactionTable1736333719719
  implements MigrationInterface
{
  name = 'AddStatusColumnInRazorPayTransactionTable1736333719719';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` ADD \`status\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` DROP COLUMN \`status\``,
    );
  }
}
