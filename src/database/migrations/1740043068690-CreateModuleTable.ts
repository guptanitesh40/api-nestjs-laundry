import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateModuleTable1740043068690 implements MigrationInterface {
  name = 'CreateModuleTable1740043068690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`modules\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`module_id\` int NOT NULL AUTO_INCREMENT, \`module_name\` varchar(255) NOT NULL, PRIMARY KEY (\`module_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`modules\``);
  }
}
