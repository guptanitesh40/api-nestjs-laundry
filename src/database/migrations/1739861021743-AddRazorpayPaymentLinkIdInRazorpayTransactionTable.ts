import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRazorpayPaymentLinkIdInRazorpayTransactionTable1739861021743
  implements MigrationInterface
{
  name = 'AddRazorpayPaymentLinkIdInRazorpayTransactionTable1739861021743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` ADD \`razorpay_payment_link_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` DROP COLUMN \`razorpay_payment_link_id\``,
    );
  }
}
