import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlagColumnInRoleTable1740043428874
  implements MigrationInterface
{
  name = 'AddFlagColumnInRoleTable1740043428874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`flag\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`flag\``);
  }
}
