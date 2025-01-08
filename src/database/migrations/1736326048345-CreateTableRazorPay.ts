import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableRazorPay1736326048345 implements MigrationInterface {
  name = 'CreateTableRazorPay1736326048345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`razorpay_transactions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`razorpay_transition_id\` int NOT NULL AUTO_INCREMENT, \`razorpay_order_id\` varchar(255) NULL, \`currency\` varchar(255) NULL, \`amount\` int NULL, \`user_id\` int NULL, PRIMARY KEY (\`razorpay_transition_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` ADD CONSTRAINT \`FK_76a4555b86a921033e6ca657dd3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`razorpay_transactions\` DROP FOREIGN KEY \`FK_76a4555b86a921033e6ca657dd3\``,
    );
    await queryRunner.query(`DROP TABLE \`razorpay_transactions\``);
  }
}
