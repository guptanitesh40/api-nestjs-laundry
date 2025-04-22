import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGstInColumnInOrderTable1745240749154
  implements MigrationInterface
{
  name = 'AddGstInColumnInOrderTable1745240749154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`gstin\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`gstin\``);
  }
}
