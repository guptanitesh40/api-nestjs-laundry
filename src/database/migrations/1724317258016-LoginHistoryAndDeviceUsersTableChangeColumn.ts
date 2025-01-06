import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginHistoryAndDeviceUsersTableChangeColumn1724317258016
  implements MigrationInterface
{
  name = 'LoginHistoryAndDeviceUsersTableChangeColumn1724317258016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`device_users\` CHANGE \`device_type\` \`device_type\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` CHANGE \`device_token\` \`device_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`type\` \`type\` varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`type\` \`type\` varchar(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` CHANGE \`device_token\` \`device_token\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_users\` CHANGE \`device_type\` \`device_type\` varchar(255) NOT NULL`,
    );
  }
}
