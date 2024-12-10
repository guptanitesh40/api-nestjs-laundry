import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnMobileNumberInContactUsTable1733808753234
  implements MigrationInterface
{
  name = 'AddColumnMobileNumberInContactUsTable1733808753234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`contact_us\` ADD \`mobile_number\` decimal NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`contact_us\` DROP COLUMN \`mobile_number\``,
    );
  }
}
