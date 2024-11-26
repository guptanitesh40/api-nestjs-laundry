import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImageColumnSetArrayInNoteTable1732530063452
  implements MigrationInterface
{
  name = 'UpdateImageColumnSetArrayInNoteTable1732530063452';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`image\` \`images\` varchar(255) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`images\``);
    await queryRunner.query(`ALTER TABLE \`notes\` ADD \`images\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`images\``);
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD \`images\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notes\` CHANGE \`images\` \`image\` varchar(255) NULL`,
    );
  }
}
