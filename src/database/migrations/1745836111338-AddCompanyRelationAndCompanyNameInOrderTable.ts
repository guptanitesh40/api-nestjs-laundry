import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyRelationAndCompanyNameInOrderTable1745836111338
  implements MigrationInterface
{
  name = 'AddCompanyRelationAndCompanyNameInOrderTable1745836111338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`companies\` ADD \`gst_percentage\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` ADD \`hsn_sac_code\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` ADD \`signature_image\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`companies\` DROP COLUMN \`signature_image\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` DROP COLUMN \`hsn_sac_code\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`companies\` DROP COLUMN \`gst_percentage\``,
    );
  }
}
