import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderTableColumnShippingChargesToNormalDeliveryCharges1740659637651
  implements MigrationInterface
{
  name =
    'UpdateOrderTableColumnShippingChargesToNormalDeliveryCharges1740659637651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`shipping_charges\` \`normal_delivery_charges\` float NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`normal_delivery_charges\` \`normal_delivery_charges\` float NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`normal_delivery_charges\` \`normal_delivery_charges\` float NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`normal_delivery_charges\` \`shipping_charges\` float NOT NULL`,
    );
  }
}
