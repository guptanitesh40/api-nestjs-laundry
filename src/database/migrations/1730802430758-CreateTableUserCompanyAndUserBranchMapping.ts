import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserCompanyAndUserBranchMapping1730802430758
  implements MigrationInterface
{
  name = 'CreateTableUserCompanyAndUserBranchMapping1730802430758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_company_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_company_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`company_id\` int NULL, PRIMARY KEY (\`user_company_mapping_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_branch_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_branch_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`branch_id\` int NULL, PRIMARY KEY (\`user_branch_mapping_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user_branch_mapping\``);
    await queryRunner.query(`DROP TABLE \`user_company_mapping\``);
  }
}
