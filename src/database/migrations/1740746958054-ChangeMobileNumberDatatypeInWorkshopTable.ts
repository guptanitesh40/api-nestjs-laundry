import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMobileNumberDatatypeInWorkshopTable1740746958054
  implements MigrationInterface
{
  name = 'ChangeMobileNumberDatatypeInWorkshopTable1740746958054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`workshop\` DROP COLUMN \`mobile_number\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`workshop\` ADD \`mobile_number\` varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`workshop\` DROP COLUMN \`mobile_number\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`workshop\` ADD \`mobile_number\` decimal NULL`,
    );
  }
}
