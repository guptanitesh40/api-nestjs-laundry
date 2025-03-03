import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnBranchMobileNumberInBranchTable1740979320864
  implements MigrationInterface
{
  name = 'AddColumnBranchMobileNumberInBranchTable1740979320864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branches\` ADD \`branch_mobile_number\` varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branches\` DROP COLUMN \`branch_mobile_number\``,
    );
  }
}
