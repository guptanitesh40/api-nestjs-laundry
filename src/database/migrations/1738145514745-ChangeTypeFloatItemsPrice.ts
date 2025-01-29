import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeFloatItemsPrice1738145514745
  implements MigrationInterface
{
  name = 'ChangeTypeFloatItemsPrice1738145514745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP COLUMN \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`price\` float NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP COLUMN \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`price\` decimal NOT NULL`,
    );
  }
}
