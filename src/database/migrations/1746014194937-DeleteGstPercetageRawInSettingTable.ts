import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteGstPercetageRawInSettingTable1746014194937
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`settings\` WHERE \`setting_key\` = 'gst_percentage'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`) VALUES ('gst_percentage', '18')`,
    );
  }
}
