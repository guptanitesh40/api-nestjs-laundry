import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePriceContentTable1733913445602
  implements MigrationInterface
{
  name = 'CreatePriceContentTable1733913445602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`price-content\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`price_content_id\` int NOT NULL AUTO_INCREMENT, \`category_name\` varchar(255) NOT NULL, \`service_names\` text NOT NULL, \`price\` int NOT NULL, PRIMARY KEY (\`price_content_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`price-content\``);
  }
}
