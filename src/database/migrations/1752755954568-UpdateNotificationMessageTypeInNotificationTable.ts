import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationMessageTypeInNotificationTable1752755954568
  implements MigrationInterface
{
  name = 'UpdateNotificationMessageTypeInNotificationTable1752755954568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP COLUMN \`notification_message\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD \`notification_message\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP COLUMN \`notification_message\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD \`notification_message\` varchar(255) NOT NULL`,
    );
  }
}
