import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveGstColumnInOrderTable1746014970407
  implements MigrationInterface
{
  name = 'RemoveGstColumnInOrderTable1746014970407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`gst\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`gst\` float NULL`);
  }
}
