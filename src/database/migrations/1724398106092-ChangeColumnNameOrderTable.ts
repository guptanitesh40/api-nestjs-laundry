import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeColumnNameOrderTable1724398106092
  implements MigrationInterface
{
  name = 'ChangeColumnNameOrderTable1724398106092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`shipping_charge\` \`shipping_charges\` float NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`shipping_charges\` \`shipping_charge\` decimal NOT NULL`,
    );
  }
}
