import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyRelationAndCompanyNameInOrderTable1745840008111
  implements MigrationInterface
{
  name = 'AddCompanyRelationAndCompanyNameInOrderTable1745840008111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`company_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`gst_company_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_f5d519a61e918f7efb299de31a0\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`company_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_f5d519a61e918f7efb299de31a0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`gst_company_name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`company_id\``,
    );
  }
}
