import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnTypeImageInNoteTable1732265954087
  implements MigrationInterface
{
  name = 'UpdateColumnTypeImageInNoteTable1732265954087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`image\` \`image\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`image\` \`image\` varchar(255) NOT NULL`,
    );
  }
}
