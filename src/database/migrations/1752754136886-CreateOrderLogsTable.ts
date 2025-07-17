import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderLogsTable1752754136886 implements MigrationInterface {
  name = 'CreateOrderLogsTable1752754136886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_logs\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`order_log_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`order_id\` int NOT NULL, \`type\` varchar(255) NOT NULL, PRIMARY KEY (\`order_log_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_logs\` ADD CONSTRAINT \`FK_d61beeea5db1e0e1910a6266384\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_logs\` ADD CONSTRAINT \`FK_03afb74d68d64c9d3271bcd7012\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_logs\` DROP FOREIGN KEY \`FK_03afb74d68d64c9d3271bcd7012\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_logs\` DROP FOREIGN KEY \`FK_d61beeea5db1e0e1910a6266384\``,
    );
    await queryRunner.query(`DROP TABLE \`order_logs\``);
  }
}
