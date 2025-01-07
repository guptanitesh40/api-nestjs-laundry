import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRazorPayOrderIdInOrderTable1736163726050
  implements MigrationInterface
{
  name = 'AddRazorPayOrderIdInOrderTable1736163726050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`razorpay_order_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`razorpay_order_id\``,
    );
  }
}
