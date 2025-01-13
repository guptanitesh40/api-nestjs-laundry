import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdrressTypeColumnInOrdersTable1736752662209
  implements MigrationInterface
{
  name = 'AddAdrressTypeColumnInOrdersTable1736752662209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`address_type\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`address_type\``,
    );
  }
}
