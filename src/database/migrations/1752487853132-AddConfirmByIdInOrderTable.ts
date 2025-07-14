import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfirmByIdInOrderTable1752487853132
  implements MigrationInterface
{
  name = 'AddConfirmByIdInOrderTable1752487853132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`confirm_by_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_be5767d2b007e932bed714496a9\` FOREIGN KEY (\`confirm_by_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_be5767d2b007e932bed714496a9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`confirm_by_id\``,
    );
  }
}
