import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWhyChooseUsTable1751974507867 implements MigrationInterface {
  name = 'CreateWhyChooseUsTable1751974507867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`why-choose-us\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`why_choose_us_id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`why_choose_us_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`why-choose-us\``);
  }
}
