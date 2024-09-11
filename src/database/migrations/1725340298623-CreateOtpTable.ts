import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOtpTable1725340298623 implements MigrationInterface {
  name = 'CreateOtpTable1725340298623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`otps\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`otp_id\` int NOT NULL AUTO_INCREMENT, \`mobile_number\` decimal NULL, \`otp\` int NOT NULL, \`type\` enum ('1', '2') NOT NULL, PRIMARY KEY (\`otp_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`otps\``);
  }
}
