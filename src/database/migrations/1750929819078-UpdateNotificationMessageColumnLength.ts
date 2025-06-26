import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationMessageColumnLength1750929819078
  implements MigrationInterface
{
  name = 'UpdateNotificationMessageColumnLength1750929819078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`labels\` DROP COLUMN \`txt_hindi\``);
    await queryRunner.query(
      `ALTER TABLE \`notifications\` DROP COLUMN \`notification_message\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD \`notification_message\` varchar(500) NOT NULL`,
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
