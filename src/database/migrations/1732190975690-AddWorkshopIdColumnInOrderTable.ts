import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkshopIdColumnInOrderTable1732190975690
  implements MigrationInterface
{
  name = 'AddWorkshopIdColumnInOrderTable1732190975690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`workshop_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_61f46108a50368482ec70ffffdb\` FOREIGN KEY (\`workshop_id\`) REFERENCES \`workshop\`(\`workshop_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_61f46108a50368482ec70ffffdb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`workshop_id\``,
    );
  }
}
