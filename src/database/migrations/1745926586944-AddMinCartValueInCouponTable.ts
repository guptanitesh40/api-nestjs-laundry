import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinCartValueInCouponTable1745926586944
  implements MigrationInterface
{
  name = 'AddMinCartValueInCouponTable1745926586944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`coupons\` ADD \`min_cart_value\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`coupons\` DROP COLUMN \`min_cart_value\``,
    );
  }
}
