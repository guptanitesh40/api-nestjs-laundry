import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOrderTableColumnType1728901643293
  implements MigrationInterface
{
  name = 'ChangeOrderTableColumnType1728901643293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`sub_total\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`sub_total\` float NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`coupon_discount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`coupon_discount\` float NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`total\` float NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`kasar_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`kasar_amount\` float NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`paid_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`paid_amount\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`paid_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`paid_amount\` decimal NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`kasar_amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`kasar_amount\` decimal NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`total\` decimal NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`shipping_charges\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`shipping_charges\` decimal NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`coupon_discount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`coupon_discount\` decimal NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`sub_total\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`sub_total\` decimal NOT NULL`,
    );
  }
}
