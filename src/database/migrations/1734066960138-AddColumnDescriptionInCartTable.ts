import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnDescriptionInCartTable1734066960138
  implements MigrationInterface
{
  name = 'AddColumnDescriptionInCartTable1734066960138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`carts\` ADD \`description\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`carts\` DROP COLUMN \`description\``,
    );
  }
}
