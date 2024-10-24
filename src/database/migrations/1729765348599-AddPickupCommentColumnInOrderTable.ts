import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPickupCommentColumnInOrderTable1729765348599
  implements MigrationInterface
{
  name = 'AddPickupCommentColumnInOrderTable1729765348599';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`pickup_comment\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`pickup_comment\``,
    );
  }
}
