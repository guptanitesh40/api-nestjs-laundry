import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserCompanyAndUserBranchMapping1730871910964
  implements MigrationInterface
{
  name = 'CreateTableUserCompanyAndUserBranchMapping1730871910964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_company_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_company_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`company_id\` int NULL, PRIMARY KEY (\`user_company_mapping_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_branch_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_branch_mapping_id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`branch_id\` int NULL, PRIMARY KEY (\`user_branch_mapping_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` ADD CONSTRAINT \`FK_b751daf88766ef22811568489b0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` ADD CONSTRAINT \`FK_3c4e502930ae45f8cfa6a748308\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`company_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` ADD CONSTRAINT \`FK_77df6938e773045fd5335f1b4f8\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` ADD CONSTRAINT \`FK_e1af0e82946ee421b581bde0edb\` FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\`(\`branch_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` DROP FOREIGN KEY \`FK_e1af0e82946ee421b581bde0edb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_branch_mapping\` DROP FOREIGN KEY \`FK_77df6938e773045fd5335f1b4f8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` DROP FOREIGN KEY \`FK_3c4e502930ae45f8cfa6a748308\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_company_mapping\` DROP FOREIGN KEY \`FK_b751daf88766ef22811568489b0\``,
    );
    await queryRunner.query(`DROP TABLE \`user_branch_mapping\``);
    await queryRunner.query(`DROP TABLE \`user_company_mapping\``);
  }
}
