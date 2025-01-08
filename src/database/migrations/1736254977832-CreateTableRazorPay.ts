import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableRazorPay1736254977832 implements MigrationInterface {
  name = 'CreateTableRazorPay1736254977832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`razorpay\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`razorpay_id\` int NOT NULL AUTO_INCREMENT, \`razorpay_order_id\` varchar(255) NULL, PRIMARY KEY (\`razorpay_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`razorpay\``);
  }
}
