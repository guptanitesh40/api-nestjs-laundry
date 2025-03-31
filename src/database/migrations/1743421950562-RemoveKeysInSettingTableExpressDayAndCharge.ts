import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveKeysInSettingTableExpressDayAndCharge1743421950562
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`settings\` WHERE \`setting_key\` IN ('express_delivery_charge', 'estimate_delivery_express_day')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`) VALUES 
        ('express_delivery_charge', 'your_default_value'), 
        ('estimate_delivery_express_day', 'your_default_value')`,
    );
  }
}
