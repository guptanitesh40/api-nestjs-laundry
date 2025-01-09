import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnNameInRazorPayTransactionTable1736339230298
  implements MigrationInterface
{
  name = 'UpdateColumnNameInRazorPayTransactionTable1736339230298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` CHANGE \`razorpay_transition_id\` \`razorpay_transaction_id\` int NOT NULL AUTO_INCREMENT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` CHANGE \`razorpay_transaction_id\` \`razorpay_transition_id\` int NOT NULL AUTO_INCREMENT`,
    );
  }
}
