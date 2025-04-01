import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnAddressTableDefaultColumn1743426884258
  implements MigrationInterface
{
  name = 'AddColumnAddressTableDefaultColumn1743426884258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD \`is_default\` tinyint NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP COLUMN \`is_default\``,
    );
  }
}
