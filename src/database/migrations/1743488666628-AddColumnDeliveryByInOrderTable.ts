import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnDeliveryByInOrderTable1743488666628
  implements MigrationInterface
{
  name = 'AddColumnDeliveryByInOrderTable1743488666628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivery_by\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivery_by\``,
    );
  }
}
