import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLaundryBranchTable1752498596227
  implements MigrationInterface
{
  name = 'CreateLaundryBranchTable1752498596227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`laundry-branches\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`laundry_branch_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NULL, \`phone_number1\` varchar(255) NULL, \`phone_number2\` varchar(255) NULL, \`lat\` varchar(255) NULL, \`long\` varchar(255) NULL, PRIMARY KEY (\`laundry_branch_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`laundry-branches\``);
  }
}
