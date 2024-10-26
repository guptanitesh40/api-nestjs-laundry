import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkshopManagerIdColumnInOrderTable1729769592260
  implements MigrationInterface
{
  name = 'AddWorkshopManagerIdColumnInOrderTable1729769592260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`workshop_manager_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_6651b57b4ec20964b7d2771392c\` FOREIGN KEY (\`workshop_manager_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_6651b57b4ec20964b7d2771392c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`workshop_manager_id\``,
    );
  }
}
