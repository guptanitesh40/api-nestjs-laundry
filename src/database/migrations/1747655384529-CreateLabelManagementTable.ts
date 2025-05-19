import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLabelManagementTable1747655384529
  implements MigrationInterface
{
  name = 'CreateLabelManagementTable1747655384529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`label_management\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`label_management_id\` int NOT NULL AUTO_INCREMENT, \`label_name\` varchar(255) NOT NULL, PRIMARY KEY (\`label_management_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`label_management\``);
  }
}
