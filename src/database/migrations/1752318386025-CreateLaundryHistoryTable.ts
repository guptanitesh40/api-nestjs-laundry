import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLaundryHistoryTable1752318386025
  implements MigrationInterface
{
  name = 'CreateLaundryHistoryTable1752318386025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`laundry_histories\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`laundry_history_id\` int NOT NULL AUTO_INCREMENT, \`year\` int NOT NULL, \`description\` text NOT NULL, \`image\` varchar(255) NOT NULL, PRIMARY KEY (\`laundry_history_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`laundry_histories\``);
  }
}
