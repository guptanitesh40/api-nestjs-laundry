import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchIdColumnInOrderTable1731908470868
  implements MigrationInterface
{
  name = 'AddBranchIdColumnInOrderTable1731908470868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`branch_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_17b723da2c12837f4bc21e33398\` FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\`(\`branch_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_17b723da2c12837f4bc21e33398\``,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`branch_id\``);
  }
}
