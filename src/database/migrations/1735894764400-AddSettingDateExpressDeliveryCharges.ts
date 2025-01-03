import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingDateExpressDeliveryCharges1735894764400
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO settings (setting_key, setting_value) VALUES ('express_delivery_charge', '100')
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`settings\` WHERE \`setting_key\` = 'express_delivery_charge'`,
    );
  }
}
