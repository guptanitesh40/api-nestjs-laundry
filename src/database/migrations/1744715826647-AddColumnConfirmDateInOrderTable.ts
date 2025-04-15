import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnConfirmDateInOrderTable1744715826647
  implements MigrationInterface
{
  name = 'AddColumnConfirmDateInOrderTable1744715826647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`confirm_date\` date NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`confirm_date\``,
    );
  }
}
