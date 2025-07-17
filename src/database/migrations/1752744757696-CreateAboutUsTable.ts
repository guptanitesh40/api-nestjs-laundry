import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAboutUsTable1752744757696 implements MigrationInterface {
  name = 'CreateAboutUsTable1752744757696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`about-us\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`about_us_id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description1\` text NOT NULL, \`description2\` text NOT NULL, \`image\` varchar(255) NOT NULL, \`description3\` text NOT NULL, \`description4\` text NOT NULL, \`youtube_link\` varchar(255) NOT NULL, PRIMARY KEY (\`about_us_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`about-us\``);
  }
}
