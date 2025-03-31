import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataInSettingTableExpressHours1743422245201
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`) VALUES 
            ('express_delivery_24hrs', '50'),
            ('express_delivery_48hrs', '25'),
            ('express_delivery_72hrs', '10')
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM \`settings\` WHERE \`setting_key\` IN 
            ('express_delivery_24hrs', 'express_delivery_48hrs', 'express_delivery_72hrs')
          `);
  }
}
