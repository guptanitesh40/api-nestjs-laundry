import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationMessageColumnInNotificationTable1747888899716
  implements MigrationInterface
{
  name = 'AddNotificationMessageColumnInNotificationTable1747888899716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD \`notification_message\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP COLUMN \`notification_message\``,
    );
  }
}
