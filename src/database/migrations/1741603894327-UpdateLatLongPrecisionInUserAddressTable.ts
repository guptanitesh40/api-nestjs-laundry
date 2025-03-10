import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLatLongPrecisionInUserAddressTable1741603894327
  implements MigrationInterface
{
  name = 'UpdateLatLongPrecisionInUserAddressTable1741603894327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`device_users\` DROP COLUMN \`device_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` ADD \`device_type\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`lat\` \`lat\` decimal(10,7) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`long\` \`long\` decimal(10,7) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`long\` \`long\` decimal(10,0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`lat\` \`lat\` decimal(10,0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` DROP COLUMN \`device_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` ADD \`device_type\` varchar(255) NULL`,
    );
  }
}
