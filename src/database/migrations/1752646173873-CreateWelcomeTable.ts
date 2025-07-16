import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWelcomeTable1752646173873 implements MigrationInterface {
  name = 'CreateWelcomeTable1752646173873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`welcome\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`welcome_id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description1\` text NOT NULL, \`description2\` text NOT NULL, \`image\` varchar(255) NOT NULL, PRIMARY KEY (\`welcome_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`welcome\``);
  }
}
