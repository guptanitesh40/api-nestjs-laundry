import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserCompanyAndUserBranchMapping1730870351694
  implements MigrationInterface
{
  name = 'CreateTableUserCompanyAndUserBranchMapping1730870351694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_company_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_company_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`company_id\` int NULL, \`userUserId\` int NOT NULL, \`companyCompanyId\` int NOT NULL, PRIMARY KEY (\`user_company_mapping_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_branch_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_branch_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`branch_id\` int NULL, \`userUserId\` int NOT NULL, \`branchBranchId\` int NOT NULL, PRIMARY KEY (\`user_branch_mapping_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` ADD CONSTRAINT \`FK_b49e52cf7b0e4eadcf59d26cf9a\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` ADD CONSTRAINT \`FK_a012d2165e7d3e8a927b960620e\` FOREIGN KEY (\`companyCompanyId\`) REFERENCES \`companies\`(\`company_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` ADD CONSTRAINT \`FK_f083ca5b2dc7c501a8dbba7633a\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` ADD CONSTRAINT \`FK_21d8e74b8419c4ed18fb35725c2\` FOREIGN KEY (\`branchBranchId\`) REFERENCES \`branches\`(\`branch_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` DROP FOREIGN KEY \`FK_21d8e74b8419c4ed18fb35725c2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` DROP FOREIGN KEY \`FK_f083ca5b2dc7c501a8dbba7633a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` DROP FOREIGN KEY \`FK_a012d2165e7d3e8a927b960620e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` DROP FOREIGN KEY \`FK_b49e52cf7b0e4eadcf59d26cf9a\``,
    );
    await queryRunner.query(`DROP TABLE \`user_branch_mapping\``);
    await queryRunner.query(`DROP TABLE \`user_company_mapping\``);
  }
}
