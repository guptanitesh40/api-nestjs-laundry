import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryCollectAmountColumnInOrderTable1749115104920
  implements MigrationInterface
{
  name = 'AddDeliveryCollectAmountColumnInOrderTable1749115104920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivery_collect_amount\` int NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivery_collect_amount\``,
    );
  }
}
