import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdProofAndEducationQualificationColumnInUserTable1730889880697
  implements MigrationInterface
{
  name = 'AddIdProofAndEducationQualificationColumnInUserTable1730889880697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`id_proof\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`education_qualification\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`education_qualification\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`id_proof\``);
  }
}
