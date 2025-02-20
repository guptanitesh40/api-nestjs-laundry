import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlagColumnInRoleTable1740050932144
  implements MigrationInterface
{
  name = 'AddFlagColumnInRoleTable1740050932144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`roles\` ADD \`flag\` tinyint NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`flag\``);
  }
}
