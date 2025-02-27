import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateShippingChargeToNormalDeliveryCharges1740645003312
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`settings\` SET \`setting_key\` = 'normal_delivery_charges' WHERE \`setting_key\` = 'shipping_charge'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`settings\` SET \`setting_key\` = 'shipping_charge' WHERE \`setting_key\` = 'normal_delivery_charges'`,
    );
  }
}
