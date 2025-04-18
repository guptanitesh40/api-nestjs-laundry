import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTextNoteColumnOptinal1744957296292
  implements MigrationInterface
{
  name = 'UpdateTextNoteColumnOptinal1744957296292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`text_note\` \`text_note\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`text_note\` \`text_note\` text NOT NULL`,
    );
  }
}
