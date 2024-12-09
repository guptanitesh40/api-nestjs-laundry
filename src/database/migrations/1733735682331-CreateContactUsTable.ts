import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactUsTable1733735682331 implements MigrationInterface {
  name = 'CreateContactUsTable1733735682331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`contact_us\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`contact_us_id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NULL, \`email\` varchar(255) NULL, \`message\` varchar(255) NULL, PRIMARY KEY (\`contact_us_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`contact_us\``);
  }
}
