import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMsmeNumberColumnInCompanyTable1745923509862
  implements MigrationInterface
{
  name = 'AddMsmeNumberColumnInCompanyTable1745923509862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`companies\` ADD \`msme_number\` varchar(20) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`companies\` DROP COLUMN \`msme_number\``,
    );
  }
}
