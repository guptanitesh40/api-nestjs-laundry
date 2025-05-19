import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLanguageTable1747657208783 implements MigrationInterface {
  name = 'CreateLanguageTable1747657208783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`languages\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`language_id\` int NOT NULL AUTO_INCREMENT, \`language_name\` varchar(255) NOT NULL, \`language_code\` varchar(255) NOT NULL, PRIMARY KEY (\`language_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`languages\``);
  }
}
