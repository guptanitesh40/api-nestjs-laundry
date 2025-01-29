import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommissionPercentageAndSecurityDepositDataTypeChange1738151395455
  implements MigrationInterface
{
  name = 'CommissionPercentageAndSecurityDepositDataTypeChange1738151395455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`commission_percentage\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`commission_percentage\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`security_deposit\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`security_deposit\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`security_deposit\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`security_deposit\` decimal NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`commission_percentage\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`commission_percentage\` decimal(5,2) NULL`,
    );
  }
}
