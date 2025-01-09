import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdInFeedBackTable1736405473154
  implements MigrationInterface
{
  name = 'AddUserIdInFeedBackTable1736405473154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feedback\` ADD \`user_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feedback\` ADD CONSTRAINT \`FK_121c67d42dd543cca0809f59901\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feedback\` DROP FOREIGN KEY \`FK_121c67d42dd543cca0809f59901\``,
    );
    await queryRunner.query(`ALTER TABLE \`feedback\` DROP COLUMN \`user_id\``);
  }
}
